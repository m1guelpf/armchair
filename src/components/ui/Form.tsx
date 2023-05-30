'use client'

import { cn } from '@/lib/utils'
import Label from '@/components/ui/Label'
import { TransformationContext } from 'typescript'
import { Slot, SlotProps } from '@radix-ui/react-slot'
import { BaseSyntheticEvent, FC, FormEvent } from 'react'
import type { Root as LabelRoot, LabelProps } from './Label'
import { ElementRef, HTMLAttributes, createContext, forwardRef, useContext, useId } from 'react'
import {
	useForm,
	FieldPath,
	Controller,
	FieldValues,
	FormProvider,
	useFormContext,
	ControllerProps,
	FormProviderProps,
} from 'react-hook-form'

type FormProps<
	TFieldValues extends FieldValues,
	TContext = any,
	TTransformedValues extends FieldValues | undefined = undefined
> = {
	className?: string
	onSubmit: (data: TFieldValues) => void
} & FormProviderProps<TFieldValues, TContext, TTransformedValues>

const Form = <
	TFieldValues extends FieldValues,
	TContext = any,
	TTransformedValues extends FieldValues | undefined = undefined
>({
	children,
	onSubmit,
	className,
	...form
}: FormProps<TFieldValues, TContext, TTransformedValues>) => {
	const handleSubmit = async (event: FormEvent) => {
		const data = await new Promise<TFieldValues>(resolve => {
			// @ts-ignore -- Types are enforced one level up
			form.handleSubmit(data => resolve(data))(event)
		})

		onSubmit(data)
	}

	return (
		<FormProvider {...form}>
			<form className={cn(className)} onSubmit={handleSubmit}>
				{children}
			</form>
		</FormProvider>
	)
}

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
	name: TName
}

const FormFieldContext = createContext<FormFieldContextValue>({} as FormFieldContextValue)

export const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	)
}

export const useFormField = () => {
	const fieldContext = useContext(FormFieldContext)
	const itemContext = useContext(FormItemContext)
	const { getFieldState, formState } = useFormContext()

	const fieldState = getFieldState(fieldContext.name, formState)

	if (!fieldContext) throw new Error('useFormField should be used within <FormField>')

	const { id } = itemContext

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formMessageId: `${id}-form-item-message`,
		formDescriptionId: `${id}-form-item-description`,
		...fieldState,
	}
}

type FormItemContextValue = {
	id: string
}

const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue)

export const FormItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
	const id = useId()

	return (
		<FormItemContext.Provider value={{ id }}>
			<div ref={ref} className={cn('space-y-2', className)} {...props} />
		</FormItemContext.Provider>
	)
})
FormItem.displayName = 'FormItem'

export const FormLabel = forwardRef<ElementRef<LabelRoot>, LabelProps>(({ className, ...props }, ref) => {
	const { error, formItemId } = useFormField()

	return <Label ref={ref} className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props} />
})
FormLabel.displayName = 'FormLabel'

export const FormControl = forwardRef<ElementRef<typeof Slot>, SlotProps>(({ ...props }, ref) => {
	const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

	return (
		<Slot
			ref={ref}
			id={formItemId}
			aria-invalid={!!error}
			aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
			{...props}
		/>
	)
})
FormControl.displayName = 'FormControl'

export const FormDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
	({ className, ...props }, ref) => {
		const { formDescriptionId } = useFormField()

		return (
			<p ref={ref} id={formDescriptionId} className={cn('text-sm text-muted-foreground', className)} {...props} />
		)
	}
)
FormDescription.displayName = 'FormDescription'

export const FormMessage = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
	({ className, children, ...props }, ref) => {
		const { error, formMessageId } = useFormField()
		const body = error ? String(error?.message) : children

		if (!body) return null

		return (
			<p
				ref={ref}
				id={formMessageId}
				className={cn('text-sm font-medium text-destructive', className)}
				{...props}
			>
				{body}
			</p>
		)
	}
)
FormMessage.displayName = 'FormMessage'

export default Form
export { useForm }
