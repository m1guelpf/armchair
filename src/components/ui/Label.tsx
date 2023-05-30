'use client'

import { cn } from '@/lib/utils'
import { ElementRef, forwardRef } from 'react'
import { Root, LabelProps } from '@radix-ui/react-label'

type Root = typeof Root

const Label = forwardRef<ElementRef<Root>, LabelProps>(({ className, ...props }, ref) => (
	<Root
		ref={ref}
		className={cn(
			'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
			className
		)}
		{...props}
	/>
))
Label.displayName = Root.displayName

export default Label
export type { Root, LabelProps }
