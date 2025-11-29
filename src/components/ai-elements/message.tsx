import { cn } from "@ras-sh/ui/utils";
import type { UIMessage } from "ai";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full gap-3 py-3",
      from === "user"
        ? "is-user flex-row-reverse"
        : "is-assistant justify-start",
      className
    )}
    {...props}
  />
);

const messageContentVariants = cva("flex flex-col gap-2 text-base", {
  variants: {
    variant: {
      contained: [
        "group-[.is-user]:rounded-lg group-[.is-user]:bg-muted group-[.is-user]:px-4 group-[.is-user]:py-2.5 group-[.is-user]:text-right",
        "group-[.is-assistant]:flex-1",
      ],
      flat: [
        "group-[.is-user]:rounded-lg group-[.is-user]:bg-muted group-[.is-user]:px-4 group-[.is-user]:py-2.5 group-[.is-user]:text-right",
        "group-[.is-assistant]:flex-1",
      ],
    },
  },
  defaultVariants: {
    variant: "flat",
  },
});

export type MessageContentProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof messageContentVariants>;

export const MessageContent = ({
  children,
  className,
  variant,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(messageContentVariants({ variant, className }))}
    {...props}
  >
    {children}
  </div>
);

export type MessageAvatarProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode;
};

export const MessageAvatar = ({
  icon,
  className,
  ...props
}: MessageAvatarProps) => (
  <div
    className={cn(
      "flex size-6 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground",
      className
    )}
    {...props}
  >
    {icon}
  </div>
);
