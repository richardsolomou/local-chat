import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";
import { Suggestion } from "~/components/ai-elements/suggestion";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "~/components/ui/empty";
import { useBrowserAISupport } from "~/hooks/use-browser-ai-support";

type ChatEmptyStateProps = {
  onSuggestionClick: (suggestion: string) => void;
};

const DEFAULT_SUGGESTIONS = [
  "How does AI work?",
  "Are black holes real?",
  'How many Rs are in the word "strawberry"?',
  "What is the meaning of life?",
];

export function ChatEmptyState({ onSuggestionClick }: ChatEmptyStateProps) {
  const browserSupportsModel = useBrowserAISupport();
  const isDisabled = browserSupportsModel === false;

  return (
    <Conversation>
      <ConversationScrollButton />
      {browserSupportsModel === false && (
        <div className="-translate-x-1/2 absolute top-4 left-1/2 z-10 w-full max-w-2xl px-4">
          <Alert variant="destructive">
            <AlertDescription>
              Your browser doesn't support WebGPU, which is required for running
              AI models. Please use a WebGPU-compatible browser (Chrome 113+,
              Edge 113+, or Safari 18+).
            </AlertDescription>
          </Alert>
        </div>
      )}
      <ConversationContent className="flex min-h-full items-center justify-center">
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyTitle>Start a conversation</EmptyTitle>
            <EmptyDescription>
              Ask me anything or try one of these suggestions
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex w-full flex-wrap justify-center gap-2">
              {DEFAULT_SUGGESTIONS.map((suggestion, index) => (
                <Suggestion
                  disabled={isDisabled}
                  key={index}
                  onClick={onSuggestionClick}
                  suggestion={suggestion}
                />
              ))}
            </div>
          </EmptyContent>
        </Empty>
      </ConversationContent>
    </Conversation>
  );
}

export type { ChatEmptyStateProps };
