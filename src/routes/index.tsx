"use client";

import { useChat } from "@ai-sdk/react";
import { doesBrowserSupportBuiltInAI } from "@built-in-ai/core";
import { createFileRoute } from "@tanstack/react-router";
import { Paperclip, Send, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
} from "~/components/ai-elements/conversation";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "~/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "~/components/ai-elements/prompt-input";
import { Response } from "~/components/ai-elements/response";
import { Suggestion, Suggestions } from "~/components/ai-elements/suggestion";
import { Layout } from "~/components/layout";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const removeFile = (indexToRemove: number) => {
    if (files) {
      const dt = new DataTransfer();
      Array.from(files).forEach((file, index) => {
        if (index !== indexToRemove) {
          dt.items.add(file);
        }
      });
      setFiles(dt.files);

      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
      }
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

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Layout
      input={
        <div className="space-y-3">
          {/* Suggestions from model */}
          {suggestions.length > 0 && !isLoading && messages.length > 0 && (
            <Suggestions>
              {suggestions.map((suggestion, index) => (
                <Suggestion
                  key={index}
                  onClick={handleSuggestionClick}
                  suggestion={suggestion}
                />
              ))}
            </Suggestions>
          )}

          {/* File Previews */}
          {files && files.length > 0 && (
            <div className="flex gap-2">
              {Array.from(files).map((file, index) => (
                <div
                  className="group relative overflow-hidden rounded-lg bg-zinc-800/40"
                  key={index}
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      alt={file.name}
                      className="h-20 w-20 object-cover"
                      src={URL.createObjectURL(file)}
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center">
                      <span className="max-w-[60px] truncate text-xs text-zinc-400">
                        {file.name}
                      </span>
                    </div>
                  )}
                  <button
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                    onClick={() => removeFile(index)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                autoFocus
                disabled={isLoading}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                value={input}
              />
              <input
                accept="image/*,audio/*"
                className="hidden"
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <PromptInputSubmit
                disabled={
                  isLoading || (!input.trim() && (!files || files.length === 0))
                }
                onClick={
                  status === "submitted" || status === "streaming"
                    ? stop
                    : undefined
                }
                status={status}
                type={
                  status === "submitted" || status === "streaming"
                    ? "button"
                    : "submit"
                }
              >
                <Send className="h-4 w-4" />
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
        </div>
      }
    >
      <Conversation>
        <ConversationContent className="w-full">
          {messages.length === 0 && !browserSupportsModel && (
            <div className="flex min-h-[40vh] items-start justify-center pt-12">
              <div className="max-w-lg rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
                <p className="font-sans text-lg text-zinc-300 leading-relaxed">
                  Your browser doesn't support built-in AI. Please use Chrome
                  128+ or Edge 138+.
                </p>
              </div>
            </div>
          )}

          {messages.length === 0 && browserSupportsModel && (
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <img
                    alt="Assistant"
                    className="h-6 w-6"
                    src="/favicon-32x32.png"
                  />
                </EmptyMedia>
                <EmptyTitle>Start a conversation</EmptyTitle>
                <EmptyDescription>
                  Ask me anything or try one of these suggestions
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex w-full flex-wrap justify-center gap-2">
                  {suggestions.length > 0 && !isLoading
                    ? suggestions.map((suggestion, index) => (
                        <Suggestion
                          key={index}
                          onClick={handleSuggestionClick}
                          suggestion={suggestion}
                        />
                      ))
                    : [
                        "How does AI work?",
                        "Are black holes real?",
                        'How many Rs are in the word "strawberry"?',
                        "What is the meaning of life?",
                      ].map((suggestion, index) => (
                        <Suggestion
                          key={index}
                          onClick={handleSuggestionClick}
                          suggestion={suggestion}
                        />
                      ))}
                </div>
              </EmptyContent>
            </Empty>
          )}

          <div className="space-y-4">
            {messages.map((message) => (
              <Message
                from={message.role === "system" ? "assistant" : message.role}
                key={message.id}
              >
                <MessageAvatar
                  icon={
                    message.role === "user" ? (
                      <User className="h-3.5 w-3.5" />
                    ) : (
                      <img
                        alt="Assistant"
                        className="h-4 w-4"
                        src="/favicon-32x32.png"
                      />
                    )
                  }
                />
                <MessageContent>
                  {/* Download Progress */}
                  {message.parts
                    .filter(
                      (part) => part.type === "data-modelDownloadProgress"
                    )
                    .map((part, partIndex) => {
                      if (!part.data.message || status === "ready") {
                        return null;
                      }

                      return (
                        <div className="mb-4 space-y-2" key={partIndex}>
                          <p className="text-base text-zinc-400">
                            {part.data.message}
                          </p>
                          {part.data.status === "downloading" &&
                            part.data.progress !== undefined && (
                              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                                <div
                                  className="h-full rounded-full bg-zinc-100 transition-all duration-300"
                                  style={{
                                    width: `${part.data.progress}%`,
                                  }}
                                />
                              </div>
                            )}
                        </div>
                      );
                    })}

                  {/* File Parts */}
                  {message.parts
                    .filter((part) => part.type === "file")
                    .map((part, partIndex) => {
                      if (part.mediaType?.startsWith("image/")) {
                        return (
                          <div className="mb-3" key={partIndex}>
                            <img
                              alt={part.filename || "Uploaded image"}
                              className="max-w-md rounded-lg"
                              src={part.url}
                            />
                          </div>
                        );
                      }

                      if (part.mediaType?.startsWith("audio/")) {
                        return (
                          <div className="mb-3 space-y-2" key={partIndex}>
                            <audio
                              className="w-full max-w-md"
                              controls
                              src={part.url}
                            >
                              <track kind="captions" />
                              Your browser does not support the audio element.
                            </audio>
                            {part.filename && (
                              <p className="text-sm text-zinc-400">
                                {part.filename}
                              </p>
                            )}
                          </div>
                        );
                      }

                      return null;
                    })}

                  {/* Text Content */}
                  {message.parts
                    .filter((part) => part.type === "text")
                    .map((part, partIndex) => (
                      <div className="leading-relaxed" key={partIndex}>
                        <Response>{part.text}</Response>
                      </div>
                    ))}
                </MessageContent>
              </Message>
            ))}

            {/* Loading State */}
            {status === "submitted" && (
              <Message from="assistant">
                <MessageAvatar
                  icon={
                    <img
                      alt="Assistant"
                      className="h-4 w-4"
                      src="/favicon-32x32.png"
                    />
                  }
                />
                <MessageContent>
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                  </div>
                </MessageContent>
              </Message>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <p className="mb-3 text-sm text-zinc-300">
                  An error occurred. Please try again.
                </p>
                <Button
                  disabled={status === "streaming" || status === "submitted"}
                  onClick={() => regenerate()}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Retry
                </Button>
              </div>
            )}
          </div>
        </ConversationContent>
      </Conversation>
    </Layout>
  );
}
