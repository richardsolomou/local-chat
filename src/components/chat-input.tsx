import type { UseChatHelpers } from "@ai-sdk/react";
import type { BuiltInAIUIMessage } from "@built-in-ai/core";
import { usePostHog } from "@posthog/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ras-sh/ui/alert-dialog";
import { Button } from "@ras-sh/ui/button";
import { Paperclip, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "~/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "~/components/ai-elements/suggestion";
import { FileUpload, type FileUploadRef } from "~/components/file-upload";
import { useBrowserAISupport } from "~/hooks/use-browser-ai-support";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  files: FileList | undefined;
  onFilesChange: (files: FileList | undefined) => void;
  onSubmit: () => void;
  isLoading: boolean;
  status: UseChatHelpers<BuiltInAIUIMessage>["status"];
  stop: UseChatHelpers<BuiltInAIUIMessage>["stop"];
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  showSuggestions: boolean;
  onClearConversation?: () => void;
  hasMessages?: boolean;
}

export function ChatInput({
  input,
  onInputChange,
  files,
  onFilesChange,
  onSubmit,
  isLoading,
  status,
  stop,
  suggestions,
  onSuggestionClick,
  showSuggestions,
  onClearConversation,
  hasMessages,
}: ChatInputProps) {
  const posthog = usePostHog();
  const fileUploadRef = useRef<FileUploadRef>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevStatusRef = useRef(status);
  const browserSupportsModel = useBrowserAISupport();
  const isDisabled = browserSupportsModel === false;
  // Only disable inputs when submitting (not when streaming), so users can type next message
  const isInputDisabled = isDisabled || status === "submitted";

  // Autofocus the textarea after a message finishes
  useEffect(() => {
    if (
      prevStatusRef.current === "streaming" &&
      status === "ready" &&
      textareaRef.current
    ) {
      textareaRef.current.focus();
    }
    prevStatusRef.current = status;
  }, [status]);

  return (
    <div className="space-y-3">
      {/* Suggestions from model */}
      {!!showSuggestions &&
        suggestions.length > 0 &&
        !isLoading &&
        browserSupportsModel !== false && (
          <Suggestions>
            {suggestions.map((suggestion, index) => (
              <Suggestion
                key={index}
                onClick={(s) => {
                  posthog?.capture("suggestion_clicked", {
                    index,
                    source: "chat_input",
                  });
                  onSuggestionClick(s);
                }}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
        )}

      <FileUpload
        disabled={isInputDisabled}
        files={files}
        onFilesChange={onFilesChange}
        ref={fileUploadRef}
      >
        <PromptInput onSubmit={onSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              autoFocus
              className="text-base!"
              disabled={isInputDisabled}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Ask anything..."
              ref={textareaRef}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <div className="flex items-center gap-1">
              <Button
                disabled={isInputDisabled}
                onClick={() => {
                  posthog?.capture("file_upload_opened");
                  fileUploadRef.current?.openFileDialog();
                }}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              {!!hasMessages && !!onClearConversation && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isInputDisabled}
                      onClick={() =>
                        posthog?.capture("clear_conversation_button_clicked")
                      }
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear conversation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete all messages in the current
                        conversation. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          posthog?.capture("conversation_cleared");
                          onClearConversation();
                        }}
                      >
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <PromptInputSubmit
              disabled={
                status === "submitted" || status === "streaming"
                  ? false
                  : isDisabled ||
                    (!input.trim() && (!files || files.length === 0))
              }
              onClick={
                status === "submitted" || status === "streaming"
                  ? stop
                  : () => {}
              }
              status={status}
              type={
                status === "submitted" || status === "streaming"
                  ? "button"
                  : "submit"
              }
            />
          </PromptInputFooter>
        </PromptInput>
      </FileUpload>
    </div>
  );
}
