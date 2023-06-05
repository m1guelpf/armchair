'use client'

import * as z from 'zod'
import { useEnsName } from 'wagmi'
import { Avatar } from 'connectkit'
import { toast } from 'react-hot-toast'
import Input from '@/components/ui/Input'
import { truncateAddr } from '@/lib/utils'
import { wagmiConfig } from '@/app/client'
import { actionToast } from '@/lib/errors'
import Button from '@/components/ui/Button'
import { FC, useEffect, useState } from 'react'
import { inviteUser, updateMember } from './actions'
import { zodResolver } from '@hookform/resolvers/zod'
import { Team, TeamMember, TeamRoleType } from '@/db/schema'
import { CaretDown, CircleNotch, Crown, UserPlus } from '@phosphor-icons/react'
import Popover, { PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import Command, { CommandGroup, CommandItem, CommandList } from '@/components/ui/Command'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Form, {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	useForm,
} from '@/components/ui/Form'
import Dialog, {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/Dialog'

type TeamWithMembers = Team & { members: TeamMember[] }

const formSchema = z.object({
	address: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address')
		.or(
			z
				.string()
				.refine(
					async name => (await wagmiConfig.publicClient.getEnsAddress({ name })) != null,
					'Invalid ENS name'
				)
		),
})

const TeamMembers: FC<{
	team: TeamWithMembers
	role: TeamRoleType
}> = ({ team, role }) => {
	const [isPending, setPending] = useState<boolean>(false)
	const [showInviteMemberDialog, setShowInviteMemberDialog] = useState(false)
	const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema) })

	useEffect(() => {
		if (showInviteMemberDialog) return

		form.reset()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [showInviteMemberDialog])

	const onSubmit = async ({ address }: z.infer<typeof formSchema>) => {
		setPending(true)

		await toast
			.promise(inviteUser({ address }), {
				error: e => e.message,
				success: 'User invited!',
				loading: 'Inviting user...',
			})
			.then(() => setShowInviteMemberDialog(false))
			.finally(() => setPending(false))
	}

	return (
		<Dialog open={showInviteMemberDialog} onOpenChange={setShowInviteMemberDialog}>
			<Card className="light">
				<CardHeader className="flex-row items-center justify-between">
					<div>
						<CardTitle>Team Members</CardTitle>
						<CardDescription>Invite your team members to collaborate.</CardDescription>
					</div>
					<DialogTrigger asChild>
						<Button>
							Invite
							<UserPlus weight="bold" className="ml-2 h-4 w-4" />
						</Button>
					</DialogTrigger>
				</CardHeader>
				<CardContent className="grid gap-6">
					{team.members.map(member => (
						<Member
							role={role}
							member={member}
							key={member.userId}
							performAction={action => updateMember(member.userId, action)}
						/>
					))}
				</CardContent>
			</Card>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Member</DialogTitle>
					<DialogDescription>Invite a new member to your team.</DialogDescription>
				</DialogHeader>
				<Form {...form} onSubmit={onSubmit}>
					<div className="pb-6">
						<FormField
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Input
											placeholder="m1guelpf.eth"
											onKeyDown={e => {
												if (e.key == 'Enter') {
													e.preventDefault()
													form.handleSubmit(onSubmit)()
												}
											}}
											{...field}
										/>
									</FormControl>
									<FormDescription>
										The address or ENS name of the user you want to invite.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowInviteMemberDialog(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending && <CircleNotch className="animate-spin mr-2 h-4 w-4" weight="bold" />}
							Continue
						</Button>
					</DialogFooter>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

type MemberProps = {
	role: TeamRoleType
	member: TeamMember
	performAction: (data: TeamRoleType | 'delete') => Promise<unknown>
}
const Member: FC<MemberProps> = ({ member, role, performAction }) => {
	const [isOpen, setIsOpen] = useState(false)
	const { data: ensName } = useEnsName({ address: member.userId as `0x${string}` })

	const onUpdate = async (action: TeamRoleType | 'delete') => {
		setIsOpen(false)

		actionToast(performAction(action), {
			error: e => e.message,
			success: `${action == 'delete' ? 'Deleted' : 'Updated'} member!`,
			loading: `${action == 'delete' ? 'Delete' : 'Update'} member...`,
		})
	}

	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		setMounted(true)
	}, [])

	return (
		<div className="flex items-center justify-between space-x-4 light">
			<div className="flex items-center space-x-4">
				<Avatar address={member.userId as `0x${string}`} size={40} radius={40} />
				<div>
					<p className="text-sm font-medium leading-none text-neutral-700 flex items-center">
						{mounted && (ensName ?? truncateAddr(member.userId))}
						{member.role == 'owner' && (
							<Crown
								weight="duotone"
								className="inline-block ml-1 h-4 w-4 text-neutral-600 fill-yellow-500"
							/>
						)}
					</p>
					<p className="text-xs text-neutral-500">{member.userId}</p>
				</div>
			</div>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className="ml-auto border-neutral-300 text-neutral-800 hover:bg-neutral-50 hover:text-neutral-800 focus-visible:ring-neutral-200 focus-visible:ring-offset-1 focus-visible:ring-offset-neutral-200"
					>
						<span className="capitalize">{member.role.toLowerCase()}</span>{' '}
						<CaretDown className="ml-2 h-4 w-4 text-neutral-600" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="p-0 border-neutral-200" align="end">
					<Command className="bg-white">
						<CommandList>
							<CommandGroup>
								<CommandItem
									onSelect={() => onUpdate('member')}
									className="teamaspace-y-1 flex flex-col items-start px-4 py-2"
									disabled={role == 'member'}
								>
									<p>Member</p>
									<p className="text-sm text-muted-foreground">Can create and publish posts.</p>
								</CommandItem>
								<CommandItem
									disabled={role !== 'owner'}
									onSelect={() => onUpdate('admin')}
									className="teamaspace-y-1 flex flex-col items-start px-4 py-2 aria-disabled:opacity-40 aria-disabled:cursor-not-allowed"
								>
									<p>Admin</p>
									<p className="text-sm text-muted-foreground">
										Can create and publish posts and manage members.
									</p>
								</CommandItem>
								<CommandItem
									disabled={role !== 'owner'}
									onSelect={() => onUpdate('owner')}
									className="teamaspace-y-1 flex flex-col items-start px-4 py-2 aria-disabled:opacity-40 aria-disabled:cursor-not-allowed"
								>
									<p>Owner</p>
									<p className="text-sm text-muted-foreground">
										Can create and publish posts, manage members, and delete the team.
									</p>
								</CommandItem>
								{member.role !== 'owner' && (
									<CommandItem
										disabled={role === 'member'}
										onSelect={() => onUpdate('delete')}
										className="teamaspace-y-1 flex flex-col items-start px-4 py-2 aria-selected:bg-red-100 aria-selected:text-red-500 aria-disabled:opacity-40 aria-disabled:cursor-not-allowed"
									>
										<p>Remove</p>
										<p className="text-sm text-muted-foreground group-aria-selected:text-red-400">
											Remove this member from the team.
										</p>
									</CommandItem>
								)}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	)
}

export default TeamMembers
