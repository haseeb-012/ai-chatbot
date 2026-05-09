'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import {
	AlertCircle,
	MessageSquare,
	SendHorizontal,
	X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { HASEEB_AI_FAQ } from '@/lib/haseeb-ai';
import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

function textFromMessage(message: UIMessage) {
	return message.parts
		.filter((part): part is { type: 'text'; text: string } => part.type === 'text')
		.map((part) => part.text)
		.join('');
}

/** While tokens stream in, skip ReactMarkdown — it’s heavy to re-parse every chunk. */
function assistantMessageIsStreaming(message: UIMessage): boolean {
	return message.parts.some(
		(p) => p.type === 'text' && p.state === 'streaming',
	);
}

function ChatMarkdown({
	text,
	variant,
}: {
	text: string;
	variant: 'assistant' | 'user';
}) {
	const assistant = variant === 'assistant';

	return (
		<ReactMarkdown
			components={{
				p: ({ children }) => (
					<p
						className={cn(
							'mb-2 last:mb-0 leading-relaxed',
							assistant ? 'text-zinc-800' : 'text-white/95',
						)}>
						{children}
					</p>
				),
				strong: ({ children }) => (
					<strong
						className={cn(
							'font-semibold',
							assistant ? 'text-zinc-900' : 'text-white',
						)}>
						{children}
					</strong>
				),
				em: ({ children }) => (
					<em className={assistant ? 'italic text-zinc-800' : 'italic text-white/90'}>
						{children}
					</em>
				),
				ul: ({ children }) => (
					<ul
						className={cn(
							'my-2 list-disc space-y-1.5 pl-5 marker:text-zinc-400',
							assistant ? 'text-zinc-800' : 'text-white/95 marker:text-white/50',
						)}>
						{children}
					</ul>
				),
				ol: ({ children }) => (
					<ol
						className={cn(
							'my-2 list-decimal space-y-1.5 pl-5 marker:font-medium',
							assistant ? 'text-zinc-800 marker:text-zinc-600' : 'text-white/95 marker:text-white/70',
						)}>
						{children}
					</ol>
				),
				li: ({ children }) => (
					<li className='leading-relaxed [&_p]:my-0'>{children}</li>
				),
				h2: ({ children }) => (
					<h2
						className={cn(
							'mb-2 mt-3 text-sm font-semibold first:mt-0',
							assistant ? 'text-zinc-900' : 'text-white',
						)}>
						{children}
					</h2>
				),
				h3: ({ children }) => (
					<h3
						className={cn(
							'mb-1.5 mt-2 text-sm font-semibold first:mt-0',
							assistant ? 'text-zinc-900' : 'text-white',
						)}>
						{children}
					</h3>
				),
			}}>
			{text}
		</ReactMarkdown>
	);
}

export default function Chat() {
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState('');
	const scrollRef = useRef<HTMLDivElement>(null);

	const { messages, sendMessage, status, error, stop, clearError } = useChat({
		transport: new DefaultChatTransport({ api: '/api/chat' }),
	});

	const isLoading = status === 'submitted' || status === 'streaming';

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setInput(e.target.value);
		},
		[],
	);

	const handleSubmit = useCallback(
		(e?: React.FormEvent) => {
			e?.preventDefault();
			const trimmed = input.trim();
			if (!trimmed || isLoading) return;
			clearError?.();
			void sendMessage({ text: trimmed });
			setInput('');
		},
		[input, isLoading, sendMessage, clearError],
	);

	useEffect(() => {
		const id = requestAnimationFrame(() => {
			const el = scrollRef.current;
			if (!el) return;
			el.scrollTop = el.scrollHeight;
		});
		return () => cancelAnimationFrame(id);
	}, [messages, open, isLoading, status]);

	return (
		<>
			<section className='min-h-screen bg-zinc-50 text-zinc-800'>
				<div className='container mx-auto flex flex-col items-center justify-center px-4 py-16'>
					<h1 className='font-serif text-3xl font-medium text-zinc-900'>
						HaseebAI
					</h1>
					<p className='mt-2 max-w-md text-center text-sm text-zinc-500'>
						AI solutions for your team. Tap the chat button to talk with HaseebAI.
					</p>
				</div>
			</section>

			{/* Launcher hidden while panel open — avoids covering Send / input on small screens */}
			{!open ? (
				<Button
					type='button'
					variant='outline'
					size='icon-lg'
					aria-label='Chat with AI'
					title='Chat with AI'
					aria-expanded={false}
					onClick={() => setOpen(true)}
					className={cn(
						'fixed bottom-6 right-6 z-50 size-14 rounded-full border-zinc-200 bg-white shadow-lg',
						'text-zinc-700 hover:bg-zinc-50',
					)}>
					<MessageSquare className='size-6' aria-hidden />
				</Button>
			) : null}

			{/* Chat panel — ChatGPT-like, white */}
			{open ? (
				<div
					className={cn(
						'fixed bottom-24 right-6 z-40 flex',
						'h-[min(560px,calc(100vh-8rem))] w-[min(100vw-2rem,420px)]',
						'min-h-0 flex-col overflow-hidden rounded-2xl',
						'border border-zinc-200 bg-white shadow-2xl',
					)}
					role='dialog'
					aria-label='HaseebAI chat'>
					<div className='flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3'>
						<div className='flex items-center gap-2'>
							<Avatar className='size-8 border border-zinc-100'>
								<AvatarFallback className='bg-zinc-900 text-xs font-medium text-white'>
									H
								</AvatarFallback>
							</Avatar>
							<div>
								<p className='text-sm font-semibold text-zinc-900'>HaseebAI</p>
								<p className='text-xs text-zinc-500'>
									{isLoading ? 'Thinking…' : 'Online'}
								</p>
							</div>
						</div>
						<Button
							type='button'
							variant='ghost'
							size='icon-sm'
							className='text-zinc-500'
							aria-label='Close chat'
							onClick={() => setOpen(false)}>
							<X className='size-4' />
						</Button>
					</div>

					<ScrollArea
						className='min-h-0 flex-1 bg-white'
						ref={scrollRef}
					>
						<div className='flex flex-col gap-3 p-4'>
							{messages.length === 0 ? (
								<div className='flex flex-col gap-2'>
									<p className='text-xs font-medium uppercase tracking-wide text-zinc-400'>
										Chat with AI — try asking
									</p>
									<div className='flex flex-col gap-2'>
										{HASEEB_AI_FAQ.map((item) => (
											<button
												key={item.id}
												type='button'
												disabled={isLoading}
												onClick={() => {
													clearError?.();
													void sendMessage({ text: item.question });
												}}
												className={cn(
													'rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-left text-sm',
													'text-zinc-800 transition-colors hover:bg-zinc-100',
													'disabled:opacity-50',
												)}>
												{item.question}
											</button>
										))}
									</div>
								</div>
							) : null}

							{messages.map((message, index) => {
								const text = textFromMessage(message);
								const isUser = message.role === 'user';
								const isLast = index === messages.length - 1;
								const streamAssist =
									!isUser &&
									(assistantMessageIsStreaming(message) ||
										(isLoading &&
											isLast &&
											message.role === 'assistant'));
								return (
									<div
										key={message.id}
										className={cn(
											'flex gap-2',
											isUser ? 'justify-end' : 'justify-start',
										)}>
										{!isUser ? (
											<Avatar className='mt-0.5 size-8 shrink-0 border border-zinc-100'>
												<AvatarFallback className='bg-zinc-900 text-[10px] font-medium text-white'>
													H
												</AvatarFallback>
											</Avatar>
										) : null}
										<div
											className={cn(
												'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
												isUser
													? 'bg-zinc-900 text-white'
													: 'border border-zinc-100 bg-zinc-50 text-zinc-800',
											)}>
											{streamAssist ? (
												<div className='whitespace-pre-wrap'>
													{text}
												</div>
											) : (
												<ChatMarkdown
													text={text}
													variant={
														isUser ? 'user' : 'assistant'
													}
												/>
											)}
										</div>
									</div>
								);
							})}

							{isLoading ? (
								<div className='flex items-center gap-2 pl-10 text-xs text-zinc-400'>
									<span className='inline-flex gap-1'>
										<span className='size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.2s]' />
										<span className='size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.1s]' />
										<span className='size-1.5 animate-bounce rounded-full bg-zinc-400' />
									</span>
								</div>
							) : null}
						</div>
					</ScrollArea>

					{error ? (
						<div
							className='border-t border-zinc-100 bg-white px-3 pb-2 pt-2'
							role='alert'
							aria-live='polite'>
							<div className='flex gap-2.5 rounded-xl border border-red-200/90 bg-linear-to-b from-red-50/95 to-red-50/80 px-3 py-2.5 shadow-sm'>
								<AlertCircle
									className='mt-0.5 size-4 shrink-0 text-red-600'
									aria-hidden
								/>
								<div className='min-w-0 flex-1'>
									<p className='text-xs font-semibold tracking-tight text-red-950'>
										Couldn&apos;t reach HaseebAI
									</p>
									<p className='mt-1 text-xs leading-relaxed text-red-800/95'>
										{error.message}
									</p>
								</div>
								<Button
									type='button'
									variant='ghost'
									size='icon-xs'
									className='-mr-1 shrink-0 text-red-700/80 hover:bg-red-100/80 hover:text-red-900'
									aria-label='Dismiss error'
									onClick={() => clearError?.()}>
									<X className='size-3.5' />
								</Button>
							</div>
						</div>
					) : null}

					<form
						onSubmit={handleSubmit}
						className='border-t border-zinc-100 bg-white p-3'>
						<div className='flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2 py-1 shadow-sm focus-within:border-zinc-300'>
							<Input
								value={input}
								onChange={handleInputChange}
								placeholder='Message HaseebAI…'
								className='min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0'
							/>
							{isLoading ? (
								<Button
									type='button'
									variant='ghost'
									size='sm'
									onClick={() => void stop()}>
									Stop
								</Button>
							) : null}
							<Button
								type='submit'
								size='icon-sm'
								variant='default'
								disabled={isLoading || !input.trim()}
								className='shrink-0 rounded-lg'
								aria-label='Send message'>
								<SendHorizontal className='size-4' />
							</Button>
						</div>
					</form>
				</div>
			) : null}
		</>
	);
}
