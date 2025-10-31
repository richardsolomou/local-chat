import { doesBrowserSupportTransformersJS } from "@built-in-ai/transformers-js";
import { useEffect, useState } from "react";

export function useBrowserAISupport() {
  const [browserSupportsModel, setBrowserSupportsModel] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    setBrowserSupportsModel(doesBrowserSupportTransformersJS());
  }, []);

  return browserSupportsModel;
}
