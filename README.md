# chat.ras.sh

Local-only LLM chat application powered by WebLLM. Your conversations stay in your browser and are never sent to external servers.

## Features

- **100% Local** - All LLM inference runs in your browser via WebLLM
- **Privacy First** - No data sent to external servers, all processing in-browser
- **Multiple Models** - Choose from Qwen, Llama, Phi and other open-source models
- **Streaming Responses** - Real-time AI responses as they generate
- **Clear Loading States** - Visual indicators for downloading, thinking, and streaming
- **Modern UI** - Built with TanStack Start, React 19, and Tailwind CSS

## Tech Stack

- [TanStack Start](https://tanstack.com/start) - Full-stack React framework
- [@built-in-ai/web-llm](https://github.com/built-in-ai/web-llm) - Browser-based LLM inference
- [AI SDK](https://ai-sdk.dev/) - Streaming and message handling
- TypeScript + Tailwind CSS + @ras-sh/ui components

## Quick Start

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173 in your browser.

## Browser Requirements

This app requires a modern browser with WebGPU support:

- Chrome 113+ or Edge 113+
- Firefox Nightly (with WebGPU enabled)
- Safari Technology Preview 163+

## Usage

1. Click "Start New Conversation" to begin
2. Select a model from the dropdown (first load will download the model)
3. Type your message and press Send
4. AI responses stream in real-time
5. Conversations are kept in memory (refresh will clear history)

### Model Selection

Available models (downloaded on first use):

- **Qwen3 0.6B** - Fast and lightweight (~600MB)
- **Llama 3.2 1B** - Balanced performance (~1GB)
- **Llama 3.2 3B** - Better quality responses (~3GB)
- **Phi 4 Mini** - Microsoft's efficient model (~2GB)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm check-types` | TypeScript type checking |
| `pnpm check` | Lint code |
| `pnpm fix` | Auto-fix linting issues |

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx      # Root layout with metadata
│   └── index.tsx       # Main chat interface
├── components/
│   ├── chat-input.tsx       # Message input component
│   ├── chat-message.tsx     # Message display component
│   └── conversation-list.tsx # Sidebar conversation list
├── lib/
│   ├── ai.ts           # WebLLM integration
│   ├── types.ts        # TypeScript type definitions
│   └── seo.ts          # SEO utilities
```

## Privacy & Data

- All conversations kept in memory (not persisted)
- No data sent to external servers
- Models downloaded once and cached locally
- Refresh the page to clear conversation history

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Built by [Richard Solomou](https://ras.sh)
