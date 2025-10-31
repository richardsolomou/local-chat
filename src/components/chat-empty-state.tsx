import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";
import { Suggestion } from "~/components/ai-elements/suggestion";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

type ChatEmptyStateProps = {
  browserSupportsModel: boolean | null;
  suggestions: string[];
  isLoading: boolean;
  onSuggestionClick: (suggestion: string) => void;
};

const DEFAULT_SUGGESTIONS = [
  "How does AI work?",
  "Are black holes real?",
  'How many Rs are in the word "strawberry"?',
  "What is the meaning of life?",
];

export function ChatEmptyState({
  browserSupportsModel,
  suggestions,
  isLoading,
  onSuggestionClick,
}: ChatEmptyStateProps) {
  if (!browserSupportsModel) {
    return (
      <Conversation>
        <ConversationScrollButton />
        <ConversationContent>
          <div className="flex min-h-[40vh] items-start justify-center pt-12">
            <div className="max-w-lg rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <p className="font-sans text-lg text-zinc-300 leading-relaxed">
                Your browser doesn't support built-in AI. Please use Chrome 128+ or
                Edge 138+.
              </p>
            </div>
          </div>
        </ConversationContent>
      </Conversation>
    );
  }

  return (
    <Conversation>
      <ConversationScrollButton />
      <ConversationContent>
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <img alt="Assistant" className="h-6 w-6" src="/favicon-32x32.png" />
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
                      onClick={onSuggestionClick}
                      suggestion={suggestion}
                    />
                  ))
                : DEFAULT_SUGGESTIONS.map((suggestion, index) => (
                    <Suggestion
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
