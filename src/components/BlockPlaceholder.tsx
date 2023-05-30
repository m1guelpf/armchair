const BlockPlaceholder = () => (
	<div className="relative h-96 overflow-hidden rounded border border-dashed border-neutral-400 opacity-75">
		<svg className="absolute inset-0 h-full w-full stroke-neutral-900/10" fill="none">
			<defs>
				<pattern
					id="pattern-bb904d76-8ce0-4b79-8986-92c472e1c066"
					x="0"
					y="0"
					width="10"
					height="10"
					patternUnits="userSpaceOnUse"
				>
					<path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3"></path>
				</pattern>
			</defs>
			<rect
				stroke="none"
				fill="url(#pattern-bb904d76-8ce0-4b79-8986-92c472e1c066)"
				width="100%"
				height="100%"
			></rect>
		</svg>
	</div>
)

export default BlockPlaceholder
