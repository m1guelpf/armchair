'use client'

import { cn } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import { actionToast } from '@/lib/errors'
import Button from '@/components/ui/Button'
import { FC, useMemo, useState } from 'react'
import { Team, teamsTable } from '@/db/schema'
import { useAccount, useEnsAvatar, useEnsName } from 'wagmi'
import { CaretUpDown, Check, PlusCircle } from '@phosphor-icons/react'
import Avatar, { AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import Popover, { PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import Command, {
	CommandItem,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandSeparator,
} from '@/components/ui/Command'
import Dialog, {
	DialogTitle,
	DialogFooter,
	DialogHeader,
	DialogContent,
	DialogTrigger,
	DialogDescription,
} from '@/components/ui/Dialog'

const groups = [
	{
		label: 'Personal Account',
		teams: [
			{
				label: 'Miguel Piedrafita',
				value: 'personal',
			},
		],
	},
	{
		label: 'Teams',
		teams: [
			{
				label: 'Acme Inc.',
				value: 'acme-inc',
			},
			{
				label: 'Monsters Inc.',
				value: 'monsters',
			},
		],
	},
]

const TeamSwitcher: FC<{
	className?: string
	teams: Team[]
	currentTeamId: number
	onCreate: (name: string) => Promise<unknown>
	onSwitch: (teamId: number) => Promise<unknown>
}> = ({ className, teams, currentTeamId, onSwitch, onCreate }) => {
	const { address } = useAccount()
	const { data: ensName } = useEnsName({ address })
	const { data: userAvatar } = useEnsAvatar({ name: ensName })

	const [open, setOpen] = useState(false)
	const [name, setName] = useState<string>('')
	const [showNewTeamDialog, setShowNewTeamDialog] = useState(false)

	const selectedTeam = useMemo(() => {
		const team = teams.find(team => team.id == currentTeamId)

		if (team && team.type == teamsTable.type.enumValues['0'] && !team.avatarUrl && userAvatar) {
			team.avatarUrl = userAvatar
		}

		return team
	}, [teams, currentTeamId, userAvatar])

	const [personalTeam, otherTeams] = useMemo(
		() => [
			teams.find(team => team.type === teamsTable.type.enumValues['0']),
			teams.filter(team => team.type !== teamsTable.type.enumValues['0']),
		],
		[teams]
	)

	const createTeam = async () => {
		await onCreate(name)

		setName('')
		setShowNewTeamDialog(false)
	}

	return (
		<Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						size="sm"
						variant="ghost"
						role="combobox"
						aria-expanded={open}
						aria-label="Select a team"
						className={cn('w-[200px] justify-between text-neutral-200', className)}
					>
						<Avatar className="mr-2 h-5 w-5">
							<AvatarImage src={selectedTeam?.avatarUrl ?? undefined} alt={selectedTeam?.name} />
							<AvatarFallback>
								{selectedTeam?.name
									.split(' ')
									.map(word => word[0])
									.join('')}
							</AvatarFallback>
						</Avatar>
						{selectedTeam?.name}
						<CaretUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0 dark">
					<Command>
						<CommandList>
							<CommandInput placeholder="Search team..." />
							<CommandEmpty>No team found.</CommandEmpty>
							{personalTeam && (
								<CommandGroup heading="Personal Account">
									<CommandItem
										onSelect={() => {
											actionToast(onSwitch(personalTeam.id), {
												loading: 'Switching team...',
												error: 'Could not switch team.',
												success: 'Switched to personal team.',
											})
											setOpen(false)
										}}
										className="text-sm"
									>
										<Avatar className="mr-2 h-5 w-5">
											<AvatarImage
												alt={personalTeam.name}
												src={personalTeam?.avatarUrl ?? userAvatar ?? undefined}
											/>
											<AvatarFallback>
												{personalTeam.name
													.split(' ')
													.map(word => word[0])
													.join('')}
											</AvatarFallback>
										</Avatar>
										{personalTeam.name}
										<Check
											className={cn(
												'ml-auto h-4 w-4',
												currentTeamId === personalTeam.id ? 'opacity-100' : 'opacity-0'
											)}
										/>
									</CommandItem>
								</CommandGroup>
							)}
							{otherTeams && (
								<CommandGroup heading="Teams">
									{otherTeams.map(team => (
										<CommandItem
											key={team.id}
											onSelect={() => {
												actionToast(onSwitch(team.id), {
													loading: 'Switching team...',
													success: 'Switched to team.',
													error: 'Could not switch team.',
												})
												setOpen(false)
											}}
											className="text-sm"
										>
											<Avatar className="mr-2 h-5 w-5">
												<AvatarImage src={team?.avatarUrl ?? undefined} alt={team.name} />
												<AvatarFallback>
													{team.name
														.split(' ')
														.map(word => word[0])
														.join('')}
												</AvatarFallback>
											</Avatar>
											{team.name}
											<Check
												className={cn(
													'ml-auto h-4 w-4',
													currentTeamId === team.id ? 'opacity-100' : 'opacity-0'
												)}
											/>
										</CommandItem>
									))}
								</CommandGroup>
							)}
						</CommandList>
						<CommandSeparator />
						<CommandList>
							<CommandGroup>
								<DialogTrigger asChild>
									<CommandItem
										onSelect={() => {
											setOpen(false)
											setShowNewTeamDialog(true)
										}}
									>
										<PlusCircle className="mr-2 h-5 w-5" />
										Create Team
									</CommandItem>
								</DialogTrigger>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create team</DialogTitle>
					<DialogDescription>Add a new team to manage products and customers.</DialogDescription>
				</DialogHeader>
				<form action={createTeam}>
					<div className="space-y-4 py-2 pb-4">
						<div className="space-y-2">
							<Label htmlFor="name">Team name</Label>
							<Input
								id="name"
								placeholder="Acme Inc."
								value={name}
								onChange={e => setName(e.target.value)}
								onKeyDown={e => {
									if (e.key !== 'Enter') return

									e.preventDefault()
									createTeam()
								}}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowNewTeamDialog(false)}>
							Cancel
						</Button>
						<Button type="submit">Continue</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default TeamSwitcher
