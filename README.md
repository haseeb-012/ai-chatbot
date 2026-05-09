# HaseebAI Chatbot

Streaming AI chat for **HaseebAI** — a Next.js app that talks to **Google Gemini** through the [Vercel AI SDK](https://sdk.vercel.ai/). The UI uses a floating launcher, a ChatGPT-style panel, Markdown rendering for replies, and suggested prompts from `lib/haseeb-ai.ts`.

## Stack

- **Next.js** 16 (App Router) · **React** 19 · **TypeScript**
- **AI SDK** (`ai`, `@ai-sdk/react`) + **`@ai-sdk/google`** (Gemini)
- **Tailwind CSS** v4 · **shadcn/ui**-style components

## Prerequisites

- **Node.js** 18+
- **pnpm** (recommended; see `pnpm-lock.yaml`)
- A **Google AI Studio** API key: [Get API key](https://aistudio.google.com/apikey)

## Setup

1. Clone the repo and install dependencies:

   ```bash
   pnpm install
   ```

2. Create **`.env.local`** in the project root:

   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

   # Optional — overrides default Gemini model (see app/api/chat/route.ts)
   # GEMINI_MODEL=gemini-3.1-flash-lite-preview
   ```

3. Run the dev server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000). Click the chat button (bottom-right), send a message, or pick a suggested question.

## Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `pnpm dev`    | Development server       |
| `pnpm build`  | Production build         |
| `pnpm start`  | Start production server  |
| `pnpm lint`   | Run ESLint               |

## Configuration

| Item | Location |
| ---- | -------- |
| **Default model** | `app/api/chat/route.ts` — defaults to **`gemini-3.1-flash-lite-preview`** unless `GEMINI_MODEL` is set |
| **System prompt & FAQ chips** | `lib/haseeb-ai.ts` (`HASEEB_AI_SYSTEM_PROMPT`, `HASEEB_AI_FAQ`) |
| **Chat UI** | `components/chat.tsx` |
| **API route** | `app/api/chat/route.ts` → `POST /api/chat` |

### Environment variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Gemini API key ([AI Studio](https://aistudio.google.com/)) |
| `GEMINI_MODEL` | No | Model id string (must match what `@ai-sdk/google` supports) |

If your Google project or key is **suspended** or invalid, the chat will show an error — fix the key in AI Studio / Cloud Console and rotate `.env.local`.

## Deploy (e.g. Vercel)

1. Set **`GOOGLE_GENERATIVE_AI_API_KEY`** in the hosting dashboard (and **`GEMINI_MODEL`** if you use a non-default model).
2. Optional: uncomment **`export const maxDuration = 60`** in `app/api/chat/route.ts` if long streams time out on serverless.

## Learn more

- [AI SDK docs](https://sdk.vercel.ai/docs)
- [Gemini API](https://ai.google.dev/gemini-api/docs)
- [Next.js docs](https://nextjs.org/docs)
