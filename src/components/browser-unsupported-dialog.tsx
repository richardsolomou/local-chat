import { usePostHog } from "@posthog/react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ras-sh/ui/alert-dialog";
import { useBrowserAISupport } from "~/hooks/use-browser-ai-support";

function isChromiumBrowser() {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes("chrome") || userAgent.includes("edg");
}

export function BrowserUnsupportedDialog() {
  const posthog = usePostHog();
  const browserSupportsModel = useBrowserAISupport();
  // Show dialog when browser support check is complete and not supported
  const isOpen = browserSupportsModel === false;
  const isChromium = isChromiumBrowser();

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Browser Not Supported</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-zinc-300">
                Your browser doesn't support the Prompt API, which is required
                for running AI models.
              </p>

              {isChromium ? (
                <div className="space-y-2">
                  <p className="text-sm text-zinc-400">To enable it:</p>
                  <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-300">
                    <li>Make sure you're using Chrome 128+ or Edge Dev</li>
                    <li>
                      Go to{" "}
                      <code className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-xs">
                        chrome://flags/#prompt-api-for-gemini-nano-multimodal-input
                      </code>
                    </li>
                    <li>
                      Set "Prompt API for Gemini Nano with Multimodal Input" to
                      "Enabled"
                    </li>
                    <li>Restart your browser</li>
                  </ol>
                </div>
              ) : (
                <p className="text-sm text-zinc-300">
                  Please switch to Chrome 128+ or Edge Dev to use this
                  application. Other browsers don't currently support Chrome's
                  built-in AI.
                </p>
              )}

              <a
                className="inline-flex items-center text-orange-300 underline hover:text-orange-300"
                href="https://developer.chrome.com/docs/ai/built-in"
                onClick={() =>
                  posthog?.capture("learn_more_clicked", {
                    location: "unsupported_dialog",
                  })
                }
                rel="noopener noreferrer"
                target="_blank"
              >
                Learn more about Chrome's built-in AI
              </a>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
