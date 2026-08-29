import { doesBrowserSupportBuiltInAI } from "@built-in-ai/core";
import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

export function useBrowserAISupport() {
  return useSyncExternalStore(subscribe, doesBrowserSupportBuiltInAI, () => null);
}
