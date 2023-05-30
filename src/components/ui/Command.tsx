'use client'

import { cn } from '@/lib/utils'
import { Command as CommandPrimitive } from 'cmdk'
import { DialogProps } from '@radix-ui/react-dialog'
import { MagnifyingGlass } from '@phosphor-icons/react'
import Dialog, { DialogContent } from '@/components/ui/Dialog'
import { ComponentPropsWithoutRef, ElementRef, HTMLAttributes, forwardRef } from 'react'

type CommandPrimitive = typeof CommandPrimitive
const Command = forwardRef<ElementRef<CommandPrimitive>, ComponentPropsWithoutRef<CommandPrimitive>>(
	({ className, ...props }, ref) => (
		<CommandPrimitive
			ref={ref}
			className={cn(
				'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
				className
			)}
			{...props}
		/>
	)
)
Command.displayName = CommandPrimitive.displayName

export const CommandDialog = ({ children, ...props }: DialogProps) => {
	return (
		<Dialog {...props}>
			<DialogContent className="overflow-hidden p-0 shadow-2xl">
				<Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
					{children}
				</Command>
			</DialogContent>
		</Dialog>
	)
}

type Input = typeof CommandPrimitive.Input
export const CommandInput = forwardRef<ElementRef<Input>, ComponentPropsWithoutRef<Input>>(
	({ className, ...props }, ref) => (
		<div className="flex items-center border-b px-3" cmdk-input-wrapper="">
			<MagnifyingGlass className="mr-2 h-4 w-4 shrink-0 opacity-50" />
			<CommandPrimitive.Input
				ref={ref}
				className={cn(
					'placeholder-muted-foreground flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50',
					className
				)}
				{...props}
			/>
		</div>
	)
)

CommandInput.displayName = CommandPrimitive.Input.displayName

type List = typeof CommandPrimitive.List
export const CommandList = forwardRef<ElementRef<List>, ComponentPropsWithoutRef<List>>(
	({ className, ...props }, ref) => (
		<CommandPrimitive.List
			ref={ref}
			className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
			{...props}
		/>
	)
)

CommandList.displayName = CommandPrimitive.List.displayName

type Empty = typeof CommandPrimitive.Empty
export const CommandEmpty = forwardRef<ElementRef<Empty>, ComponentPropsWithoutRef<Empty>>((props, ref) => (
	<CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

type Group = typeof CommandPrimitive.Group
export const CommandGroup = forwardRef<ElementRef<Group>, ComponentPropsWithoutRef<Group>>(
	({ className, ...props }, ref) => (
		<CommandPrimitive.Group
			ref={ref}
			className={cn(
				'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
				className
			)}
			{...props}
		/>
	)
)

CommandGroup.displayName = CommandPrimitive.Group.displayName

type Separator = typeof CommandPrimitive.Separator
export const CommandSeparator = forwardRef<ElementRef<Separator>, ComponentPropsWithoutRef<Separator>>(
	({ className, ...props }, ref) => (
		<CommandPrimitive.Separator ref={ref} className={cn('-mx-1 h-px bg-border', className)} {...props} />
	)
)
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

type Item = typeof CommandPrimitive.Item
export const CommandItem = forwardRef<ElementRef<Item>, ComponentPropsWithoutRef<Item>>(
	({ className, ...props }, ref) => (
		<CommandPrimitive.Item
			ref={ref}
			className={cn(
				'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group',
				className
			)}
			{...props}
		/>
	)
)

CommandItem.displayName = CommandPrimitive.Item.displayName

export const CommandShortcut = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => {
	return <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props} />
}
CommandShortcut.displayName = 'CommandShortcut'

export default Command
