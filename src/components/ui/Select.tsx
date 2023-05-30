'use client'

import { cn } from '@/lib/utils'
import { ElementRef, forwardRef } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'
import {
	Root,
	Item,
	Group,
	Value,
	Icon,
	Label,
	Portal,
	Trigger,
	Content,
	Viewport,
	ItemText,
	Separator,
	ItemIndicator,
	SelectItemProps,
	SelectLabelProps,
	SelectTriggerProps,
	SelectContentProps,
	SelectSeparatorProps,
} from '@radix-ui/react-select'

const Select = Root
export const SelectGroup = Group
export const SelectValue = Value

type Trigger = typeof Trigger
export const SelectTrigger = forwardRef<ElementRef<Trigger>, SelectTriggerProps>(
	({ className, children, ...props }, ref) => (
		<Trigger
			ref={ref}
			className={cn(
				'flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
				className
			)}
			{...props}
		>
			{children}
			<Icon asChild>
				<CaretDown className="h-4 w-4 opacity-50" />
			</Icon>
		</Trigger>
	)
)
SelectTrigger.displayName = Trigger.displayName

type Content = typeof Content
export const SelectContent = forwardRef<ElementRef<Content>, SelectContentProps>(
	({ className, children, position = 'popper', ...props }, ref) => (
		<Portal>
			<Content
				ref={ref}
				className={cn(
					'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80',
					position === 'popper' && 'translate-y-1',
					className
				)}
				position={position}
				{...props}
			>
				<Viewport
					className={cn(
						'p-1',
						position === 'popper' &&
							'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
					)}
				>
					{children}
				</Viewport>
			</Content>
		</Portal>
	)
)
SelectContent.displayName = Content.displayName

type Label = typeof Label
export const SelectLabel = forwardRef<ElementRef<Label>, SelectLabelProps>(({ className, ...props }, ref) => (
	<Label ref={ref} className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)} {...props} />
))
SelectLabel.displayName = Label.displayName

type Item = typeof Item
export const SelectItem = forwardRef<ElementRef<Item>, SelectItemProps>(({ className, children, ...props }, ref) => (
	<Item
		ref={ref}
		className={cn(
			'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
			className
		)}
		{...props}
	>
		<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			<ItemIndicator>
				<Check className="h-4 w-4" />
			</ItemIndicator>
		</span>

		<ItemText>{children}</ItemText>
	</Item>
))
SelectItem.displayName = Item.displayName

type Separator = typeof Separator
export const SelectSeparator = forwardRef<ElementRef<Separator>, SelectSeparatorProps>(
	({ className, ...props }, ref) => (
		<Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
	)
)
SelectSeparator.displayName = Separator.displayName

export default Select
