'use client'

import { cn } from '@/lib/utils'
import { Root, Image, Fallback } from '@radix-ui/react-avatar'
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'

type Root = typeof Root
const Avatar = forwardRef<ElementRef<Root>, ComponentPropsWithoutRef<Root>>(({ className, ...props }, ref) => (
	<Root
		ref={ref}
		className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
		{...props}
	/>
))
Avatar.displayName = Root.displayName

type Image = typeof Image
export const AvatarImage = forwardRef<ElementRef<Image>, ComponentPropsWithoutRef<Image>>(
	({ className, ...props }, ref) => (
		// eslint-disable-next-line jsx-a11y/alt-text -- Not Next's Image component
		<Image ref={ref} className={cn('aspect-square h-full w-full', className)} {...props} />
	)
)
AvatarImage.displayName = Image.displayName

type Fallback = typeof Fallback
export const AvatarFallback = forwardRef<ElementRef<Fallback>, ComponentPropsWithoutRef<Fallback>>(
	({ className, ...props }, ref) => (
		<Fallback
			ref={ref}
			className={cn('flex h-full w-full text-[9px] items-center justify-center rounded-full bg-muted', className)}
			{...props}
		/>
	)
)
AvatarFallback.displayName = Fallback.displayName

export default Avatar
