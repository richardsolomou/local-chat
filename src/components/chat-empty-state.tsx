import { usePostHog } from "@posthog/react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@ras-sh/ui/empty";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";
import { Suggestion } from "~/components/ai-elements/suggestion";
import { BrowserUnsupportedDialog } from "~/components/browser-unsupported-dialog";
import { useBrowserAISupport } from "~/hooks/use-browser-ai-support";

interface ChatEmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

const DEFAULT_SUGGESTIONS = [
  "How does AI work?",
  "Are black holes real?",
  'How many Rs are in the word "strawberry"?',
  "What is the meaning of life?",
];

export function ChatEmptyState({ onSuggestionClick }: ChatEmptyStateProps) {
  const posthog = usePostHog();
  const browserSupportsModel = useBrowserAISupport();
  const isDisabled = browserSupportsModel === false;

  return (
    <Conversation>
      <BrowserUnsupportedDialog />

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
                  onClick={(s) => {
                    posthog?.capture("suggestion_clicked", {
                      index,
                      source: "empty_state",
                    });
                    onSuggestionClick(s);
                  }}
                  suggestion={suggestion}
                />
              ))}
            </div>
          </EmptyContent>
        </Empty>
      </ConversationContent>

      <ConversationScrollButton />
    </Conversation>
  );
}

export type { ChatEmptyStateProps };
