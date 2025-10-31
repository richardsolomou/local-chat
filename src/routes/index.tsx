"use client";

import { useChat } from "@ai-sdk/react";
import {
  type BuiltInAIUIMessage,
  doesBrowserSupportBuiltInAI,
} from "@built-in-ai/core";
import { createFileRoute } from "@tanstack/react-router";
import { Paperclip, Send, Sparkles, X } from "lucide-react";
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
import { Button } from "~/components/ui/button";
import { ClientSideChatTransport } from "~/lib/client-side-chat-transport";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check browser support only on client side
  useEffect(() => {
    setIsClient(true);
    setBrowserSupportsModel(doesBrowserSupportBuiltInAI());
  }, []);

  const {
    error,
    status,
    sendMessage,
    messages,
    regenerate,
    stop,
    setMessages,
  } = useChat<BuiltInAIUIMessage>({
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
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="px-6 py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-foreground/60" />
            <h1 className="font-medium text-foreground/80 text-lg">
              chat.ras.sh
            </h1>
          </div>
          {messages.length > 0 && (
            <Button
              disabled={isLoading}
              onClick={() => setMessages([])}
              size="sm"
              variant="ghost"
            >
              Clear
            </Button>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-4xl px-6 py-8">
          {messages.length === 0 && (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="max-w-lg space-y-8 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-foreground/40" />
                <div className="space-y-3">
                  <h2 className="font-medium text-2xl text-foreground/90">
                    Welcome to chat.ras.sh
                  </h2>
                  <p className="text-balance text-base text-muted-foreground">
                    {browserSupportsModel
                      ? "Your conversations are completely private and processed locally in your browser."
                      : "Your browser doesn't support built-in AI. Please use Chrome 128+ or Edge 138+."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((message) => (
              <Message
                from={message.role === "system" ? "assistant" : message.role}
                key={message.id}
              >
                <MessageAvatar
                  name={message.role === "user" ? "You" : "AI"}
                  src=""
                />
                <MessageContent>
                  {/* Download Progress */}
                  {message.parts
                    .filter(
                      (part) => part.type === "data-modelDownloadProgress"
                    )
                    .map((part, partIndex) => {
                      if (!part.data.message || status === "ready") return null;

                      return (
                        <div className="mb-4 space-y-2" key={partIndex}>
                          <p className="text-base text-muted-foreground">
                            {part.data.message}
                          </p>
                          {part.data.status === "downloading" &&
                            part.data.progress !== undefined && (
                              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all duration-300"
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
                              <p className="text-muted-foreground text-sm">
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
                      <div className="text-base leading-7" key={partIndex}>
                        <Response>{part.text}</Response>
                      </div>
                    ))}
                </MessageContent>
              </Message>
            ))}

            {/* Loading State */}
            {status === "submitted" && (
              <Message from="assistant">
                <MessageAvatar name="AI" src="" />
                <MessageContent>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </MessageContent>
              </Message>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/30">
                <p className="mb-3 text-red-800 dark:text-red-200">
                  An error occurred while processing your request.
                </p>
                <Button
                  disabled={status === "streaming" || status === "submitted"}
                  onClick={() => regenerate()}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </ConversationContent>
      </Conversation>

      {/* Input Area */}
      <div className="px-6 py-6">
        <div className="mx-auto max-w-4xl space-y-3">
          {/* File Previews */}
          {files && files.length > 0 && (
            <div className="flex gap-2">
              {Array.from(files).map((file, index) => (
                <div
                  className="group relative overflow-hidden rounded-lg bg-muted/40"
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
                      <span className="max-w-[60px] truncate text-muted-foreground text-xs">
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
                className="text-base"
                disabled={isLoading}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message..."
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
              <div className="flex items-center gap-2">
                <Button
                  className="h-8"
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Paperclip className="mr-1.5 h-4 w-4" />
                  Attach
                </Button>
                <span className="text-muted-foreground text-xs">
                  All conversations are processed locally
                </span>
              </div>
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
      </div>
    </div>
  );
}
