import { DefaultToastOptions, Renderable, ValueOrFunction, toast } from 'react-hot-toast'

declare const brand: unique symbol
type Brand<T, TBrand extends string> = T & { [brand]: TBrand }

const PRODUCTION_ERROR =
	'An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error.'

export type Error = Brand<{ message: string }, 'Error'>

export const error = (message: string): Error => ({ message } as Error)

export const isError = (value: unknown): value is Error => {
	return typeof value === 'object' && value !== null && brand in value
}

type ToastMessages<T> = {
	loading: Renderable
	success: ValueOrFunction<Renderable, T>
	error: ValueOrFunction<Renderable, any>
}

export const actionToast = <T>(promise: Promise<T>, messages: ToastMessages<T>, opts?: DefaultToastOptions) => {
	const augmentedPromise = async () => {
		const result = await promise.catch(error => {
			if (error.message == PRODUCTION_ERROR) {
				error.message = 'Something went wrong. Please try again.'
			}

			throw error
		})

		if (isError(result)) throw new Error(result.message)
		return result
	}

	toast.promise(augmentedPromise(), messages, opts)
}
