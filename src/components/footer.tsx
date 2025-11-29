import { usePostHog } from "@posthog/react";
import { Avatar, AvatarFallback, AvatarImage } from "@ras-sh/ui/avatar";

export function Footer() {
  const posthog = usePostHog();

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 text-center text-xs text-zinc-400 sm:text-sm">
      Made with ❤️ by{" "}
      <a
        className="inline-flex items-center gap-1 font-medium underline decoration-zinc-600 underline-offset-2 transition-colors hover:text-zinc-100 hover:decoration-zinc-400"
        href="https://solomou.dev"
        onClick={() =>
          posthog?.capture("footer_link_clicked", {
            destination_url: "https://solomou.dev",
          })
        }
        rel="noopener noreferrer"
        target="_blank"
      >
        <Avatar className="size-5">
          <AvatarImage
            alt="Richard Solomou"
            src="https://github.com/richardsolomou.png"
          />
          <AvatarFallback>RS</AvatarFallback>
        </Avatar>
        @richardsolomou
      </a>
    </div>
  );
}
