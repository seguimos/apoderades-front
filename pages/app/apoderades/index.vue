<template lang="pug">
.appApoderadesIndex
	n-link.tarjeta(to="/app/apoderades/buscar")
		a-button(@click.stop) Buscar apoderados
	n-link.tarjeta(to="/app/apoderades/inscribir")
		a-button(@click.stop) Inscribir apoderados
</template>
<script>
export default {}
</script>
<style lang="sass" scoped>
.appApoderadesIndex
	// display: flex
	// flex-flow: column nowrap
	// min-height: 80vh
	.tarjeta
		// flex: 5em 1 1
		display: block

</style>
