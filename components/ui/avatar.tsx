"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type AvatarContextValue = {
	imageLoaded: boolean
	setImageLoaded: React.Dispatch<React.SetStateAction<boolean>>
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null)

const Avatar = React.forwardRef<
	HTMLSpanElement,
	React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => {
	const [imageLoaded, setImageLoaded] = React.useState(false)

	return (
		<AvatarContext.Provider value={{ imageLoaded, setImageLoaded }}>
			<span
				ref={ref}
				className={cn(
					"relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
					className,
				)}
				{...props}
			/>
		</AvatarContext.Provider>
	)
})
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
	HTMLImageElement,
	React.ComponentPropsWithoutRef<"img">
>(({ className, onLoad, onError, ...props }, ref) => {
	const ctx = React.useContext(AvatarContext)
	const setImageLoaded = ctx?.setImageLoaded

	React.useEffect(() => {
		setImageLoaded?.(false)
	}, [props.src, setImageLoaded])

	return (
		<img
			ref={ref}
			className={cn(
				"absolute inset-0 size-full object-cover",
				className,
			)}
			onLoad={(e) => {
				setImageLoaded?.(true)
				onLoad?.(e)
			}}
			onError={(e) => {
				setImageLoaded?.(false)
				onError?.(e)
			}}
			{...props}
		/>
	)
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
	HTMLSpanElement,
	React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => {
	const ctx = React.useContext(AvatarContext)
	if (ctx?.imageLoaded) return null

	return (
		<span
			ref={ref}
			className={cn(
				"absolute inset-0 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800",
				className,
			)}
			{...props}
		/>
	)
})
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
