import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

import { HASEEB_AI_SYSTEM_PROMPT } from '@/lib/haseeb-ai';

/** Override with `GEMINI_MODEL` in `.env`. Default: Gemini 3.1 Flash Lite (preview id from AI SDK). */
const GEMINI_MODEL =
	process.env.GEMINI_MODEL?.trim() || 'gemini-3.1-flash-lite-preview';

// Optional on Vercel for long streams:
// export const maxDuration = 60

export async function POST(req: Request) {
	try {
		if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
			return new NextResponse('Missing Google Generative AI API key.', {
				status: 400,
			});
		}

		const { messages }: { messages: UIMessage[] } = await req.json();

		const useThinkingBudget =
			/gemini-(2\.5|3)/.test(GEMINI_MODEL) || GEMINI_MODEL.includes('thinking');

		const result = streamText({
			model: google(GEMINI_MODEL),
			system: HASEEB_AI_SYSTEM_PROMPT,
			messages: await convertToModelMessages(messages),
			maxRetries: 1,
			...(useThinkingBudget ?
				{
					providerOptions: {
						google: {
							thinkingConfig: { thinkingBudget: 0 },
						},
					},
				}
			:	{}),
		});

		return result.toUIMessageStreamResponse();
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Something went wrong!';
		return new NextResponse(message, { status: 500 });
	}
}
