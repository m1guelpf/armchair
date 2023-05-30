'use client'

import { cn } from '@/lib/utils'
import { ElementRef, HTMLAttributes, forwardRef } from 'react'
import { Check, CaretRight, Circle } from '@phosphor-icons/react'
import {
	Sub,
	Root,
	Item,
	Group,
	Label,
	Portal,
	Trigger,
	Content,
	Separator,
	RadioItem,
	RadioGroup,
	SubTrigger,
	SubContent,
	CheckboxItem,
	ItemIndicator,
	MenuSubTriggerProps,
	DropdownMenuItemProps,
	DropdownMenuLabelProps,
	DropdownMenuContentProps,
	DropdownMenuRadioItemProps,
	DropdownMenuSeparatorProps,
	DropdownMenuSubContentProps,
	DropdownMenuCheckboxItemProps,
} from '@radix-ui/react-dropdown-menu'

const DropdownMenu = Root
export const DropdownMenuSub = Sub
export const DropdownMenuGroup = Group
export const DropdownMenuPortal = Portal
export const DropdownMenuTrigger = Trigger
export const DropdownMenuRadioGroup = RadioGroup

type DropdownMenySubTriggerProps = MenuSubTriggerProps & { inset?: boolean }

type SubTrigger = typeof SubTrigger
export const DropdownMenuSubTrigger = forwardRef<ElementRef<SubTrigger>, DropdownMenySubTriggerProps>(
	({ className, inset, children, ...props }, ref) => (
		<SubTrigger
			ref={ref}
			className={cn(
				'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent',
				inset && 'pl-8',
				className
			)}
			{...props}
		>
			{children}
			<CaretRight className="ml-auto h-4 w-4" />
		</SubTrigger>
	)
)
DropdownMenuSubTrigger.displayName = SubTrigger.displayName

type SubContent = typeof SubContent
export const DropdownMenuSubContent = forwardRef<ElementRef<SubContent>, DropdownMenuSubContentProps>(
	({ className, ...props }, ref) => (
		<SubContent
			ref={ref}
			className={cn(
				'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
				className
			)}
			{...props}
		/>
	)
)
DropdownMenuSubContent.displayName = SubContent.displayName

type Content = typeof Content
export const DropdownMenuContent = forwardRef<ElementRef<Content>, DropdownMenuContentProps>(
	({ className, sideOffset = 4, ...props }, ref) => (
		<Portal>
			<Content
				ref={ref}
				sideOffset={sideOffset}
				className={cn(
					'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
					className
				)}
				{...props}
			/>
		</Portal>
	)
)
DropdownMenuContent.displayName = Content.displayName

type ItemProps = DropdownMenuItemProps & { inset?: boolean }

type Item = typeof Item
export const DropdownMenuItem = forwardRef<ElementRef<Item>, ItemProps>(({ className, inset, ...props }, ref) => (
	<Item
		ref={ref}
		className={cn(
			'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
			inset && 'pl-8',
			className
		)}
		{...props}
	/>
))
DropdownMenuItem.displayName = Item.displayName

type CheckboxItem = typeof CheckboxItem
export const DropdownMenuCheckboxItem = forwardRef<ElementRef<CheckboxItem>, DropdownMenuCheckboxItemProps>(
	({ className, children, checked, ...props }, ref) => (
		<CheckboxItem
			ref={ref}
			className={cn(
				'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
				className
			)}
			checked={checked}
			{...props}
		>
			<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
				<ItemIndicator>
					<Check className="h-4 w-4" />
				</ItemIndicator>
			</span>
			{children}
		</CheckboxItem>
	)
)
DropdownMenuCheckboxItem.displayName = CheckboxItem.displayName

type RadioItem = typeof RadioItem
export const DropdownMenuRadioItem = forwardRef<ElementRef<RadioItem>, DropdownMenuRadioItemProps>(
	({ className, children, ...props }, ref) => (
		<RadioItem
			ref={ref}
			className={cn(
				'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
				className
			)}
			{...props}
		>
			<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
				<ItemIndicator>
					<Circle className="h-2 w-2 fill-current" />
				</ItemIndicator>
			</span>
			{children}
		</RadioItem>
	)
)
DropdownMenuRadioItem.displayName = RadioItem.displayName

type LabelProps = DropdownMenuLabelProps & {
	inset?: boolean
}

type Label = typeof Label
export const DropdownMenuLabel = forwardRef<ElementRef<Label>, LabelProps>(({ className, inset, ...props }, ref) => (
	<Label ref={ref} className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)} {...props} />
))
DropdownMenuLabel.displayName = Label.displayName

type Separator = typeof Separator
export const DropdownMenuSeparator = forwardRef<ElementRef<Separator>, DropdownMenuSeparatorProps>(
	({ className, ...props }, ref) => (
		<Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
	)
)
DropdownMenuSeparator.displayName = Separator.displayName

export const DropdownMenuShortcut = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => {
	return <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
}

export default DropdownMenu
