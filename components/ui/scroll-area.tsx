'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

/** Scrollable region for flex layouts — parent column must have a fixed or flex-derived height. */
const ScrollArea = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
	<div
		className={cn(
			'relative h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden',
			className,
		)}
		{...props}
	>
		<div
			ref={ref}
			className='h-full min-h-0 w-full overflow-y-auto overflow-x-hidden overscroll-y-contain rounded-[inherit] scrollbar-gutter-stable'
		>
			{children}
		</div>
	</div>
))
ScrollArea.displayName = 'ScrollArea'

const ScrollBar = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(() => null)
ScrollBar.displayName = 'ScrollBar'

export { ScrollArea, ScrollBar }
