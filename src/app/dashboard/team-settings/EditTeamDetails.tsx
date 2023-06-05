'use client'

import * as z from 'zod'
import { FC } from 'react'
import { Team } from '@/db/schema'
import { APP_NAME } from '@/lib/consts'
import { toast } from 'react-hot-toast'
import Input from '@/components/ui/Input'
import { updateTeamData } from './actions'
import { actionToast } from '@/lib/errors'
import Button from '@/components/ui/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import Card, { CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import Form, {
	useForm,
	FormItem,
	FormField,
	FormLabel,
	FormMessage,
	FormControl,
	FormDescription,
} from '@/components/ui/Form'

const formSchema = z.object({
	name: z.string().min(2).max(50),
	avatarUrl: z.union([z.literal(''), z.string().trim().url()]),
})

const EditTeamDetails: FC<{ team: Team }> = ({ team }) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { name: team.name, avatarUrl: team.avatarUrl ?? '' },
	})

	return (
		<Form
			{...form}
			onSubmit={data =>
				actionToast(updateTeamData(data), {
					error: e => e.message,
					success: 'Updated team!',
					loading: 'Updating team...',
				})
			}
			className="space-y-8"
		>
			<FormField
				name="name"
				render={({ field }) => (
					<Card>
						<CardHeader className="pb-4">
							<FormLabel className="text-lg text-neutral-900 font-semibold leading-none tracking-tight">
								Team Name
							</FormLabel>
							<FormDescription className="text-sm text-neutral-500">
								This is your team&apos;s visible name within {APP_NAME}. For example, the name of your
								company or department.
							</FormDescription>
						</CardHeader>
						<CardContent className="grid gap-6">
							<FormItem className="grid gap-1">
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						</CardContent>
						<CardFooter className="justify-end space-x-2">
							<Button>Submit</Button>
						</CardFooter>
					</Card>
				)}
			/>
			<FormField
				name="avatarUrl"
				render={({ field, fieldState }) => (
					<Card>
						<CardHeader className="pb-4 flex-row items-center justify-between">
							<div>
								<FormLabel className="text-lg text-neutral-900 font-semibold leading-none tracking-tight">
									Team Avatar
								</FormLabel>
								<FormDescription className="text-sm text-neutral-500">
									This is your team&apos;s avatar. We&apos;ll use your team&apos;s initial if left
									empty.
								</FormDescription>
							</div>
							{!fieldState.invalid && field.value && (
								// eslint-disable-next-line @next/next/no-img-element
								<img className="w-10 h-10 rounded-full" src={field.value} alt="" />
							)}
						</CardHeader>
						<CardContent className="grid gap-6">
							<FormItem className="grid gap-1">
								<FormControl>
									<Input type="url" placeholder="https://example.com/avatar.jpg" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						</CardContent>
						<CardFooter className="justify-end space-x-2">
							<Button>Submit</Button>
						</CardFooter>
					</Card>
				)}
			/>
		</Form>
	)
}

export default EditTeamDetails
