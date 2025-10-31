import {
  doesBrowserSupportTransformersJS,
  transformersJS,
} from "@built-in-ai/transformers-js";
import {
  type ChatRequestOptions,
  type ChatTransport,
  convertToModelMessages,
  createUIMessageStream,
  extractReasoningMiddleware,
  streamText,
  type UIMessageChunk,
  wrapLanguageModel,
} from "ai";
import type { ExtendedBuiltInAIUIMessage } from "~/types/ui-message";

const SYSTEM_PROMPT =
  "You are a helpful AI assistant. Be concise and brief in your responses. Keep answers short and to the point.";

/**
 * Client-side chat transport implementation that handles AI model communication
 * with Transformers.js using SmolLM2 as the browser-based model.
 *
 * Best practices implemented:
 * - Web Worker for offloading heavy computation from UI thread
 * - Browser capability checks before operations
 * - Proper availability state management
 * - Progress tracking for model downloads
 *
 * @implements {ChatTransport<ExtendedBuiltInAIUIMessage>}
 */
export class ClientSideChatTransport
  implements ChatTransport<ExtendedBuiltInAIUIMessage>
{
  private worker: Worker | null = null;

  /**
   * Get or create the Transformers.js worker instance.
   * Using a worker offloads heavy model computation to a different thread than the UI.
   */
  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(
        new URL("./transformers-worker.ts", import.meta.url),
        { type: "module" }
      );
    }
    return this.worker;
  }

  /**
   * Initialize and return the base model with reasoning middleware.
   */
  private createModel() {
    const baseModel = transformersJS("HuggingFaceTB/SmolLM2-360M-Instruct", {
      worker: this.getWorker(),
      dtype: "q4",
    });

    const model = wrapLanguageModel({
      model: baseModel,
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    });

    return { baseModel, model };
  }

  /**
   * Write download progress update to the stream.
   */
  private writeDownloadProgress({
    writer,
    id,
    status,
    progress,
    message,
  }: {
    writer: any;
    id: string;
    status: "downloading" | "complete";
    progress: number;
    message: string;
  }): void {
    writer.write({
      type: "data-modelDownloadProgress",
      id,
      data: { status, progress, message },
      transient: true,
    });
  }

  /**
   * Stream response chunks from the model to the writer.
   * Handles both text-delta and reasoning-delta chunk types.
   */
  private async streamResponse({
    model,
    prompt,
    writer,
    abortSignal,
  }: {
    model: ReturnType<typeof wrapLanguageModel>;
    prompt: ReturnType<typeof convertToModelMessages>;
    writer: any;
    abortSignal?: AbortSignal;
  }): Promise<void> {
    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: prompt,
      abortSignal,
    });

    for await (const chunk of result.fullStream) {
      switch (chunk.type) {
        case "text-delta":
          writer.write({
            type: "text-delta",
            id: chunk.id,
            delta: chunk.text,
          });
          break;
        case "reasoning-delta":
          writer.write({
            type: "reasoning-delta",
            id: chunk.id,
            delta: chunk.text,
          });
          break;
        default:
          writer.write(chunk as any);
      }
    }
  }

  async sendMessages(
    options: {
      chatId: string;
      messages: ExtendedBuiltInAIUIMessage[];
      abortSignal: AbortSignal | undefined;
    } & {
      trigger: "submit-message" | "submit-tool-result" | "regenerate-message";
      messageId: string | undefined;
    } & ChatRequestOptions
  ): Promise<ReadableStream<UIMessageChunk>> {
    const { messages, abortSignal } = options;

    // Best practice: Verify browser capability before attempting operations
    if (!doesBrowserSupportTransformersJS()) {
      return createUIMessageStream<ExtendedBuiltInAIUIMessage>({
        execute: ({ writer }) => {
          writer.write({
            type: "data-notification",
            data: {
              message:
                "WebGPU/WebAssembly is not supported in this browser. Please use a compatible browser.",
              level: "error",
            },
            transient: true,
          });
        },
      });
    }

    const prompt = convertToModelMessages(messages);

    // Use SmolLM2-360M for fast, lightweight inference in the browser
    // Run in a Web Worker to avoid blocking the UI thread
    const { baseModel, model } = this.createModel();

    // Best practice: Check availability state before operations
    // States: "unavailable" | "downloadable" | "downloading" | "available"
    const availability = await baseModel.availability();
    if (availability === "available") {
      return createUIMessageStream<ExtendedBuiltInAIUIMessage>({
        execute: async ({ writer }) => {
          await this.streamResponse({ model, prompt, writer, abortSignal });
        },
      });
    }

    // Best practice: Handle model download with progress tracking
    // Progress callback receives WebLLMProgress with: progress (0-1), timeElapsedMs, text
    return createUIMessageStream<ExtendedBuiltInAIUIMessage>({
      execute: async ({ writer }) => {
        try {
          let downloadProgressId: string | undefined;

          // Best practice: Use createSessionWithProgress for monitoring initialization
          // Critical for UX, especially with large model downloads
          await baseModel.createSessionWithProgress(
            (progressReport: { progress: number }) => {
              const percent = Math.round(progressReport.progress * 100);

              if (progressReport.progress >= 1) {
                // Download complete - ready for inference
                if (downloadProgressId) {
                  this.writeDownloadProgress({
                    writer,
                    id: downloadProgressId,
                    status: "complete",
                    progress: 100,
                    message:
                      "Model finished downloading! Getting ready for inference...",
                  });
                }
                return;
              }

              // First progress update - initialize tracking
              if (!downloadProgressId) {
                downloadProgressId = `download-${Date.now()}`;
                this.writeDownloadProgress({
                  writer,
                  id: downloadProgressId,
                  status: "downloading",
                  progress: percent,
                  message: "Downloading browser AI model...",
                });
                return;
              }

              // Ongoing progress updates - track download state
              this.writeDownloadProgress({
                writer,
                id: downloadProgressId,
                status: "downloading",
                progress: percent,
                message: "Downloading browser AI model...",
              });
            }
          );

          // Clear progress message before streaming response
          if (downloadProgressId) {
            this.writeDownloadProgress({
              writer,
              id: downloadProgressId,
              status: "complete",
              progress: 100,
              message: "",
            });
          }

          // Stream the actual text response after model is ready
          await this.streamResponse({ model, prompt, writer, abortSignal });
        } catch (error) {
          writer.write({
            type: "data-notification",
            data: {
              message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
              level: "error",
            },
            transient: true,
          });
          throw error;
        }
      },
    });
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    // Client-side AI doesn't support stream reconnection
    return await Promise.resolve(null);
  }
}
