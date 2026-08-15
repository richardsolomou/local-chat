import { doesBrowserSupportBuiltInAI } from "@built-in-ai/core";
import { useEffect, useState } from "react";

export function useBrowserAISupport() {
  const [browserSupportsModel, setBrowserSupportsModel] = useState<boolean | null>(null);

  useEffect(() => {
    setBrowserSupportsModel(doesBrowserSupportBuiltInAI());
  }, []);

  return browserSupportsModel;
}
