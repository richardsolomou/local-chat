"use client";

import { useChat } from "@ai-sdk/react";
import { doesBrowserSupportBuiltInAI } from "@built-in-ai/core";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatEmptyState } from "~/components/chat-empty-state";
import { ChatInput } from "~/components/chat-input";
import { ChatMessages } from "~/components/chat-messages";
import { Header } from "~/components/header";
import { ClientSideChatTransport } from "~/lib/client-side-chat-transport";
import type { ExtendedBuiltInAIUIMessage } from "~/types/ui-message";

export const Route = createFileRoute("/")({
  component: Home,
});

export default function Home() {
  const [browserSupportsModel, setBrowserSupportsModel] = useState<
    boolean | null
  >(null);
  const [isClient, setIsClient] = useState(false);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Check browser support only on client side
  useEffect(() => {
    setIsClient(true);
    setBrowserSupportsModel(doesBrowserSupportBuiltInAI());
  }, []);

  const { error, status, sendMessage, messages, regenerate, stop } =
    useChat<ExtendedBuiltInAIUIMessage>({
      transport: new ClientSideChatTransport(),
      onError(error) {
        toast.error(error.message);
      },
      onData: (dataPart) => {
        // Handle transient notifications
        if (dataPart.type === "data-notification") {
          if (dataPart.data.level === "error") {
            toast.error(dataPart.data.message);
          } else if (dataPart.data.level === "warning") {
            toast.warning(dataPart.data.message);
          } else {
            toast.info(dataPart.data.message);
          }
        }
        // Handle suggestions from the model
        if (dataPart.type === "data-suggestions") {
          setSuggestions(dataPart.data);
        }
      },
      experimental_throttle: 150,
    });

  const isLoading = status !== "ready";

  // Send a message
  const handleSubmit = () => {
    if ((input.trim() || files) && status === "ready") {
      sendMessage({
        text: input,
        files,
      });
      setInput("");
      setFiles(undefined);
    }
  };

  // Show loading state until client-side check completes
  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-100" />
          <span className="text-zinc-400">Loading...</span>
        </div>
      </div>
    );
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (status === "ready") {
      sendMessage({
        text: suggestion,
        files,
      });
      setInput("");
      setFiles(undefined);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <Header />

      {/* Main Content */}
      <main className="relative mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
        {messages.length === 0 ? (
          <ChatEmptyState
            browserSupportsModel={browserSupportsModel}
            isLoading={isLoading}
            onSuggestionClick={handleSuggestionClick}
            suggestions={suggestions}
          />
        ) : (
          <ChatMessages
            error={error}
            messages={messages}
            onRegenerate={regenerate}
            status={status}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 z-20 bg-zinc-950">
        <div className="mx-auto w-full max-w-3xl space-y-4 p-4">
          <ChatInput
            files={files}
            input={input}
            isLoading={isLoading}
            onFilesChange={setFiles}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onSuggestionClick={handleSuggestionClick}
            showSuggestions={messages.length > 0}
            status={status}
            stop={stop}
            suggestions={suggestions}
          />

          <div className="flex flex-wrap items-center justify-center gap-1 text-center text-xs text-zinc-400 sm:text-sm">
            Made with ❤️ by{" "}
            <a
              className="inline-flex flex-wrap items-center gap-1 font-medium underline decoration-zinc-600 underline-offset-2 transition-colors hover:text-zinc-100 hover:decoration-zinc-400"
              href="https://ras.sh"
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                alt="ras.sh logo"
                className="size-4 sm:size-5"
                height={40}
                src="https://r2.ras.sh/icon.svg"
                width={40}
              />
              ras.sh
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
