import type { ChatStatus } from "ai";
import { User } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "~/components/ai-elements/message";
import { Response } from "~/components/ai-elements/response";
import { Button } from "~/components/ui/button";
import type { ExtendedBuiltInAIUIMessage } from "~/types/ui-message";

type ChatMessagesProps = {
  messages: ExtendedBuiltInAIUIMessage[];
  status: ChatStatus;
  error: Error | undefined;
  onRegenerate: () => void;
};

export function ChatMessages({
  messages,
  status,
  error,
  onRegenerate,
}: ChatMessagesProps) {
  return (
    <Conversation>
      <ConversationScrollButton />
      <ConversationContent>
        <div className="space-y-4 p-4">
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
                  .filter((part) => part.type === "data-modelDownloadProgress")
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
                onClick={onRegenerate}
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
  );
}

export type { ChatMessagesProps };
