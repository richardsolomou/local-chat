import { SiGithub } from "@icons-pack/react-simple-icons";
import { Button } from "~/components/ui/button";

type LayoutProps = {
  children: React.ReactNode;
  input: React.ReactNode;
};

export function Layout({ children, input }: LayoutProps) {
  return (
    <div className="h-screen w-full">
      {/* Absolute Positioned Header */}
      <header className="pointer-events-none fixed top-0 right-0 left-0 z-10">
        <div className="pointer-events-auto mx-auto w-full max-w-4xl space-y-4 bg-zinc-950 p-8 transition-all duration-300 sm:px-12 sm:pt-12 md:px-16 md:pt-16 lg:px-20 lg:pt-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-bold font-mono text-4xl text-zinc-100">chat</h1>

            <Button asChild>
              <a
                href="https://github.com/ras-sh/chat"
                rel="noopener noreferrer"
                target="_blank"
              >
                <SiGithub className="size-4" />
                GitHub
              </a>
            </Button>
          </div>

          <p className="font-sans text-xl text-zinc-300 leading-relaxed">
            💬 Your AI assistant. Private, local, and ready to help.
          </p>
        </div>
      </header>

      {/* Main Content with padding for header/footer */}
      <main className="mx-auto w-full max-w-4xl px-8 pt-[220px] pb-[280px] transition-all duration-300 sm:px-12 sm:pt-[240px] sm:pb-[300px] md:px-16 md:pt-[260px] md:pb-[320px] lg:px-20 lg:pt-[280px] lg:pb-[340px]">
        {children}
      </main>

      {/* Absolute Positioned Footer */}
      <footer className="pointer-events-none fixed right-0 bottom-0 left-0 z-10">
        <div className="pointer-events-auto mx-auto w-full max-w-4xl space-y-4 bg-zinc-950 p-8 transition-all duration-300 sm:px-12 sm:pb-12 md:px-16 md:pb-16 lg:px-20 lg:pb-20">
          {input}
          <div className="flex flex-wrap items-center justify-center gap-1 text-center text-sm text-zinc-400">
            Made with ❤️ by{" "}
            <a
              className="inline-flex flex-wrap items-center gap-1 font-medium underline decoration-zinc-600 underline-offset-2 transition-colors hover:text-zinc-100 hover:decoration-zinc-400"
              href="https://ras.sh"
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                alt="ras.sh logo"
                className="size-5"
                height={40}
                src="https://r2.ras.sh/icon.svg"
                width={40}
              />
              ras.sh
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
