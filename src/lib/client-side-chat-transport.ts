import { builtInAI } from "@built-in-ai/core";
import {
  type ChatRequestOptions,
  type ChatTransport,
  convertToModelMessages,
  createUIMessageStream,
  streamObject,
  type UIMessageChunk,
} from "ai";
import { z } from "zod";
import type { ExtendedBuiltInAIUIMessage } from "~/types/ui-message";

/**
 * Client-side chat transport implementation that handles AI model communication
 * with in-browser AI capabilities (Gemini Nano/Phi4).
 *
 * @implements {ChatTransport<ExtendedBuiltInAIUIMessage>}
 */
export class ClientSideChatTransport
  implements ChatTransport<ExtendedBuiltInAIUIMessage>
{
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

    const prompt = convertToModelMessages(messages);
    const model = builtInAI();

    // Check if model is already available to skip progress tracking
    const availability = await model.availability();
    if (availability === "available") {
      return createUIMessageStream<ExtendedBuiltInAIUIMessage>({
        execute: async ({ writer }) => {
          const result = streamObject({
            model,
            schema: z.object({
              response: z
                .string()
                .describe("The assistant's brief response to the user"),
              suggestions: z
                .array(z.string())
                .describe(
                  "3-4 relevant follow-up questions the USER could ask next (from the user's perspective, not the assistant's)"
                ),
            }),
            system:
              "Be concise and brief in your responses. Keep answers short and to the point. When providing suggestions, write them from the USER's perspective as questions they might want to ask YOU next.",
            messages: prompt,
            abortSignal,
          });

          let textId: string | undefined;
          let previousText = "";

          for await (const partialObject of result.partialObjectStream) {
            if (
              partialObject.response &&
              partialObject.response !== previousText
            ) {
              if (!textId) {
                textId = `text-${Date.now()}`;
                writer.write({
                  type: "text-start",
                  id: textId,
                });
              }
              const delta = partialObject.response.slice(previousText.length);
              if (delta) {
                writer.write({
                  type: "text-delta",
                  id: textId,
                  delta,
                });
              }
              previousText = partialObject.response;
            }
          }

          // End the text stream
          if (textId) {
            writer.write({
              type: "text-end",
              id: textId,
            });
          }

          // Send suggestions after the response is complete
          const finalObject = await result.object;
          if (finalObject.suggestions && finalObject.suggestions.length > 0) {
            writer.write({
              type: "data-suggestions",
              id: `suggestions-${Date.now()}`,
              data: finalObject.suggestions,
            });
          }
        },
      });
    }

    // Handle model download with progress tracking
    return createUIMessageStream<ExtendedBuiltInAIUIMessage>({
      execute: async ({ writer }) => {
        try {
          let downloadProgressId: string | undefined;

          // Download/prepare model with progress monitoring
          await model.createSessionWithProgress((progress: number) => {
            const percent = Math.round(progress * 100);

            if (progress >= 1) {
              // Download complete
              if (downloadProgressId) {
                writer.write({
                  type: "data-modelDownloadProgress",
                  id: downloadProgressId,
                  data: {
                    status: "complete",
                    progress: 100,
                    message:
                      "Model finished downloading! Getting ready for inference...",
                  },
                });
              }
              return;
            }

            // First progress update
            if (!downloadProgressId) {
              downloadProgressId = `download-${Date.now()}`;
              writer.write({
                type: "data-modelDownloadProgress",
                id: downloadProgressId,
                data: {
                  status: "downloading",
                  progress: percent,
                  message: "Downloading browser AI model...",
                },
                transient: true,
              });
              return;
            }

            // Ongoing progress updates
            writer.write({
              type: "data-modelDownloadProgress",
              id: downloadProgressId,
              data: {
                status: "downloading",
                progress: percent,
                message: `Downloading browser AI model... ${percent}%`,
              },
            });
          });

          // Stream the actual object response
          const result = streamObject({
            model,
            schema: z.object({
              response: z
                .string()
                .describe("The assistant's brief response to the user"),
              suggestions: z
                .array(z.string())
                .describe(
                  "3-4 relevant follow-up questions the USER could ask next (from the user's perspective, not the assistant's)"
                ),
            }),
            system:
              "Be concise and brief in your responses. Keep answers short and to the point. When providing suggestions, write them from the USER's perspective as questions they might want to ask YOU next.",
            messages: prompt,
            abortSignal,
          });

          let textId: string | undefined;
          let previousText = "";
          let firstChunk = true;

          for await (const partialObject of result.partialObjectStream) {
            // Clear progress message on first chunk
            if (firstChunk && downloadProgressId) {
              writer.write({
                type: "data-modelDownloadProgress",
                id: downloadProgressId,
                data: { status: "complete", progress: 100, message: "" },
              });
              downloadProgressId = undefined;
              firstChunk = false;
            }

            if (
              partialObject.response &&
              partialObject.response !== previousText
            ) {
              if (!textId) {
                textId = `text-${Date.now()}`;
                writer.write({
                  type: "text-start",
                  id: textId,
                });
              }
              const delta = partialObject.response.slice(previousText.length);
              if (delta) {
                writer.write({
                  type: "text-delta",
                  id: textId,
                  delta,
                });
              }
              previousText = partialObject.response;
            }
          }

          // End the text stream
          if (textId) {
            writer.write({
              type: "text-end",
              id: textId,
            });
          }

          // Send suggestions after the response is complete
          const finalObject = await result.object;
          if (finalObject.suggestions && finalObject.suggestions.length > 0) {
            writer.write({
              type: "data-suggestions",
              id: `suggestions-${Date.now()}`,
              data: finalObject.suggestions,
            });
          }
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
    return null;
  }
}
