import type { UseChatHelpers } from "@ai-sdk/react";
import { Paperclip, Send } from "lucide-react";
import { useRef } from "react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "~/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "~/components/ai-elements/suggestion";
import { FileUpload, type FileUploadRef } from "~/components/file-upload";
import { Button } from "~/components/ui/button";
import type { ExtendedBuiltInAIUIMessage } from "~/types/ui-message";

type ChatInputProps = {
  input: string;
  onInputChange: (value: string) => void;
  files: FileList | undefined;
  onFilesChange: (files: FileList | undefined) => void;
  onSubmit: () => void;
  isLoading: boolean;
  status: UseChatHelpers<ExtendedBuiltInAIUIMessage>["status"];
  stop: UseChatHelpers<ExtendedBuiltInAIUIMessage>["stop"];
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  showSuggestions: boolean;
};

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
}: ChatInputProps) {
  const fileUploadRef = useRef<FileUploadRef>(null);

  return (
    <div className="space-y-3">
      {/* Suggestions from model */}
      {showSuggestions && suggestions.length > 0 && !isLoading && (
        <Suggestions>
          {suggestions.map((suggestion, index) => (
            <Suggestion
              key={index}
              onClick={onSuggestionClick}
              suggestion={suggestion}
            />
          ))}
        </Suggestions>
      )}

      <FileUpload
        disabled={isLoading}
        files={files}
        onFilesChange={onFilesChange}
        ref={fileUploadRef}
      />

      <PromptInput onSubmit={onSubmit}>
        <PromptInputBody>
          <PromptInputTextarea
            autoFocus
            disabled={isLoading}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Ask anything..."
            value={input}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <Button
            disabled={isLoading}
            onClick={() => fileUploadRef.current?.openFileDialog()}
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
  );
}
