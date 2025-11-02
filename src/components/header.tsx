import { SiGithub } from "@icons-pack/react-simple-icons";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Sticky Top Bar */}
      <header className="sticky top-0 z-20 md:hidden">
        <div className="flex h-14 w-full items-center justify-between border-zinc-800 border-b px-4">
          <h1 className="font-bold font-mono text-xl text-zinc-100">
            local-chat.ras.sh
          </h1>

          <Button
            data-umami-event="mobile_menu_toggled"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            size="icon"
            variant="ghost"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
            <span className="sr-only">Menu</span>
          </Button>
        </div>

        {/* Mobile Menu Content - Floating */}
        {mobileMenuOpen && (
          <div className="absolute top-14 right-0 left-0 border-zinc-800 border-b p-4 shadow-lg">
            <div className="space-y-4">
              <p className="font-sans text-sm text-zinc-300 leading-relaxed">
                💬 Local-first AI chat using Chrome's built-in AI. Conversations
                run entirely in your browser and stay on your device.
              </p>

              <Button asChild className="w-full" size="sm">
                <a
                  data-umami-event="github_link_clicked"
                  data-umami-event-location="mobile_menu"
                  href="https://github.com/ras-sh/local-chat"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <SiGithub className="size-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Header */}
      <header className="sticky top-0 z-20 hidden pt-8 md:block">
        <div className="mx-auto w-full max-w-3xl space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-bold font-mono text-4xl text-zinc-100">
              local-chat.ras.sh
            </h1>

            <Button asChild>
              <a
                data-umami-event="github_link_clicked"
                data-umami-event-location="desktop_header"
                href="https://github.com/ras-sh/local-chat"
                rel="noopener noreferrer"
                target="_blank"
              >
                <SiGithub className="size-4" />
                GitHub
              </a>
            </Button>
          </div>

          <p className="font-sans text-xl text-zinc-300 leading-relaxed">
            💬 Local-first AI chat using Chrome's built-in AI. Conversations run
            entirely in your browser and stay on your device.
          </p>
        </div>
      </header>
    </>
  );
}
