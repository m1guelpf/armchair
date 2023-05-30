'use client'

import { cn } from '@/lib/utils'
import { X } from '@phosphor-icons/react'
import { ElementRef, HTMLAttributes, forwardRef } from 'react'
import {
	Root,
	Close,
	Title,
	Portal,
	Overlay,
	Content,
	Trigger,
	Description,
	DialogTitleProps,
	DialogPortalProps,
	DialogOverlayProps,
	DialogContentProps,
	DialogDescriptionProps,
} from '@radix-ui/react-dialog'

const Dialog = Root
export const DialogTrigger = Trigger

export const DialogPortal = ({ className, children, ...props }: DialogPortalProps) => (
	<Portal className={className} {...props}>
		<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">{children}</div>
	</Portal>
)

type Overlay = typeof Overlay
export const DialogOverlay = forwardRef<ElementRef<Overlay>, DialogOverlayProps>(({ className, ...props }, ref) => (
	<Overlay
		ref={ref}
		className={cn(
			'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in',
			className
		)}
		{...props}
	/>
))
DialogOverlay.displayName = Overlay.displayName

type Content = typeof Content
export const DialogContent = forwardRef<ElementRef<Content>, DialogContentProps>(
	({ className, children, ...props }, ref) => (
		<DialogPortal>
			<DialogOverlay />
			<Content
				ref={ref}
				className={cn(
					'fixed z-50 grid w-full gap-4 rounded-t-lg border bg-background p-6 shadow-lg animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 sm:max-w-lg sm:rounded-lg sm:zoom-in-90 data-[state=open]:sm:slide-in-from-bottom-0',
					className
				)}
				{...props}
			>
				{children}
				<Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</Close>
			</Content>
		</DialogPortal>
	)
)
DialogContent.displayName = Content.displayName

export const DialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)

export const DialogFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
	<div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
)

type Title = typeof Title
export const DialogTitle = forwardRef<ElementRef<Title>, DialogTitleProps>(({ className, ...props }, ref) => (
	<Title ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
))
DialogTitle.displayName = Title.displayName

type Description = typeof Description
export const DialogDescription = forwardRef<ElementRef<Description>, DialogDescriptionProps>(
	({ className, ...props }, ref) => (
		<Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
	)
)
DialogDescription.displayName = Description.displayName

export default Dialog
