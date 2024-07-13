<div class="flex h-screen">
	<div class="flex-grow">
		<slot name="left" />
	</div>
	<div class="right-column bg-gray-800 pl-4">
		<slot name="right" />
	</div>
</div>

<style>
	@media (max-width: 1400px) {
		.right-column {
			width: 400px;
		}
	}
	@media (min-width: 1400px) {
		.right-column {
			width: 800px;
		}
	}
</style>
