import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

type ModelDownloadBannerProps = {
  status: "downloading" | "complete" | "error";
  progress: number;
  message: string;
};

export function ModelDownloadBanner({
  status,
  progress,
  message,
}: ModelDownloadBannerProps) {
  // Don't show anything if complete or no message
  const isOpen = status !== "complete" && !!message;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle className="sr-only">Model Download</AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-sm text-zinc-300">{message}</p>
              {status === "downloading" && (
                <span className="font-mono text-sm text-zinc-400 tabular-nums">
                  {progress}%
                </span>
              )}
            </div>
            {status === "downloading" && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-zinc-100 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            {status === "error" && (
              <p className="text-red-400 text-sm">{message}</p>
            )}
          </div>
        </AlertDialogDescription>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export type { ModelDownloadBannerProps };
