import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';

import { HASEEB_AI_SYSTEM_PROMPT } from '@/lib/haseeb-ai';

/** Override with `OPENAI_MODEL` in `.env` (e.g. `gpt-4o`, `gpt-4o-mini`). */
const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';

// Optional on Vercel for long streams:
// export const maxDuration = 60

export async function POST(req: Request) {
	try {
		if (!process.env.OPENAI_API_KEY) {
			return new NextResponse('Missing OpenAI API key.', { status: 400 });
		}

		const { messages }: { messages: UIMessage[] } = await req.json();

		const result = streamText({
			model: openai(OPENAI_MODEL),
			system: HASEEB_AI_SYSTEM_PROMPT,
			messages: await convertToModelMessages(messages),
			maxRetries: 1,
		});

		return result.toUIMessageStreamResponse();
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Something went wrong!';
		return new NextResponse(message, { status: 500 });
	}
}
