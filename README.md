# local-chat.ras.sh

💬 Local-first AI chat using Chrome's built-in AI. Conversations run entirely in your browser and stay on your device.

## Overview

A privacy-first chat interface powered by Chrome's built-in Prompt API (Gemini Nano). All inference happens locally on your device - your conversations never leave your browser.

**Supported browsers:**

- Chrome 128+ (with Prompt API enabled)
- Edge 128+ (with Prompt API enabled)

## Features

- **100% Local** - All AI inference runs directly in your browser using Chrome's built-in Prompt API
- **Complete Privacy** - Zero external API calls, no data collection
- **Smart Suggestions** - Get contextual follow-up questions generated with structured outputs
- **Streaming Responses** - Real-time AI responses as they generate
- **Modern UI** - Clean, responsive interface built with Radix UI components
- **File Upload Support** - Attach files to your conversations

## Tech Stack

- [TanStack Start](https://tanstack.com/start) - Full-stack React framework with Vite
- [AI SDK](https://ai-sdk.dev/) - Streaming, message handling, and structured outputs
- [@built-in-ai/core](https://github.com/jakobhoeg/built-in-ai) - Chrome Prompt API integration for AI SDK
- [React 19](https://react.dev/) - Latest React with modern features
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first styling
- [Radix UI](https://radix-ui.com/) - Accessible component primitives
- [Zustand](https://zustand.docs.pmnd.rs/) - Lightweight state management

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:3000 in Chrome 128+ with Prompt API enabled.

## How It Works

This app uses Chrome's built-in Prompt API to run the Gemini Nano language model entirely in your browser. On first use, the model will be downloaded and cached locally.

All processing happens on your device using Chrome's optimized inference engine. The AI SDK handles streaming responses and structured outputs (for generating suggestions). No data is sent to external servers. State management is handled by Zustand, with suggestions stored separately from the main chat state.

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx              # Root layout with providers
│   └── index.tsx               # Main chat interface
├── components/
│   ├── ai-elements/            # AI-specific components
│   │   ├── conversation.tsx    # Conversation container
│   │   ├── message.tsx         # Individual message display
│   │   ├── prompt-input.tsx    # Prompt input with file upload
│   │   ├── response.tsx        # AI response with markdown
│   │   └── suggestion.tsx      # Suggestion chips
│   ├── ui/                     # Radix UI components
│   │   ├── button.tsx          # Button variants
│   │   ├── dialog.tsx          # Dialog/modal
│   │   ├── input.tsx           # Input field
│   │   └── ...                 # Other UI primitives
│   ├── chat-empty-state.tsx    # Empty state with starter prompts
│   ├── chat-input.tsx          # Message input with suggestions
│   ├── chat-messages.tsx       # Message list with scroll
│   ├── header.tsx              # App header with controls
│   ├── footer.tsx              # App footer with links
│   ├── file-upload.tsx         # File upload handling
│   ├── model-download-banner.tsx  # Download progress banner
│   └── browser-unsupported-dialog.tsx  # Browser check dialog
├── lib/
│   ├── client-side-chat-transport.ts  # Prompt API transport for AI SDK
│   ├── types.ts                # Shared type definitions
│   ├── utils.ts                # Utility functions (cn, etc)
│   └── seo.ts                  # SEO metadata
├── stores/
│   └── suggestions-store.ts    # Zustand store for suggestions
├── hooks/
│   ├── use-browser-ai-support.ts  # Check Prompt API availability
│   └── use-mobile.ts           # Mobile detection hook
└── types/
    └── ui-message.ts           # Extended UI message types
```

## Scripts

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `pnpm dev`         | Start Vite development server                |
| `pnpm build`       | Build for production                         |
| `pnpm preview`     | Preview production build                     |
| `pnpm check-types` | TypeScript type checking                     |
| `pnpm check`       | Lint code with Ultracite (Biome wrapper)     |
| `pnpm fix`         | Auto-fix linting issues (with --unsafe flag) |

## Browser Requirements

This app requires Chrome's built-in Prompt API:

- **Chrome 128+** - With Prompt API enabled (chrome://flags/#prompt-api-for-gemini-nano)
- **Edge 128+** - With Prompt API enabled (edge://flags/#prompt-api-for-gemini-nano)

If your browser doesn't support the Prompt API, you'll see a warning dialog on the chat interface. The app checks for support using the `doesBrowserSupportBuiltInAI()` function from `@built-in-ai/core`.

To enable the Prompt API:

1. Open chrome://flags/#prompt-api-for-gemini-nano
2. Set to "Enabled"
3. Restart Chrome

## Privacy & Data

- **No external servers** - All processing happens in your browser
- **No data collection** - Your conversations are never logged or sent anywhere
- **No persistence** - Messages are kept in memory only (refresh to clear)
- **Local model caching** - Downloaded models are cached by the browser

## Key Implementation Details

### Custom Chat Transport

The app implements a custom `ClientSideChatTransport` class (src/lib/client-side-chat-transport.ts:36) that integrates Chrome's Prompt API with the AI SDK. Key features:

- **Model availability checking** - Checks if Gemini Nano is available, downloadable, or needs to be downloaded
- **Progress tracking** - Monitors model download progress and displays a banner
- **Structured outputs** - Uses `streamObject()` to generate both responses and suggestions in a single request
- **Abort handling** - Properly handles request cancellation and cleanup

### State Management

- **Zustand store** (src/stores/suggestions-store.ts:9) - Manages AI-generated follow-up suggestions separately from chat state
- **AI SDK useChat** - Handles message state, streaming, and lifecycle

### UI Components

- **Radix UI primitives** - Accessible, unstyled components (buttons, dialogs, inputs, etc.)
- **Class Variance Authority** - Type-safe component variants
- **Tailwind CSS 4** - Latest version with Vite plugin
- **Sonner** - Toast notifications for errors and system messages

## License

MIT License - see [LICENSE](LICENSE) for details.
