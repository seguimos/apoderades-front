<template lang="pug">
.root
	h1 Chile

	.regiones
		.region(v-for="region in regiones")
			n-link(:to="`/app/Chile/${region.regionID}`")
				h2.nombre {{region.nombre}}
			//.comunas
				.comuna(v-for="comuna in region.comunas")
					.nombre {{comuna.nombre}}
</template>
<script>
export default {
	computed: {
		regiones () { return this.$chile.todasLasRegiones() }
	},
	mounted () {}
}
</script>
<style lang="sass" scoped></style>
