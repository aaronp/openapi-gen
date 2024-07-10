<main class="p-2">
	<div class="flex h-screen">
		<div class="flex-grow p-4">
			<slot name="left" />
		</div>
		<div class="right-column bg-gray-800 p-4">
			<slot name="right" />
		</div>
	</div>
</main>

<style>
	@media (max-width: 1400px) {
		.right-column {
			width: 200px;
		}
	}
	@media (min-width: 1400px) {
		.right-column {
			width: 500px;
		}
	}
</style>
