<template lang="pug">
.root
	a-page-header.headerPagina(
		title="Chile"
		Xsub-title="Comuna")


	.filtros
		a-input(v-model="busqueda" allow-clear placeholder='Nombre')
	.regiones
		.region(v-for="region in regionesFiltradas")
			n-link(:to="`/app/Chile/${region.regionID}`")
				.nombre {{region.nombreCompleto}}
</template>
<script>
export default {
	data () {
		return {
			busqueda: ''
		}
	},
	computed: {
		regiones () { return this.$chile.todasLasRegiones() },
		regionesFiltradas () { 
			const _ = this._
			const p = this.$p
			if (_.isEmpty(this.busqueda)) return this.regiones
			const busqueda = this.$p(this.busqueda)
			return _.orderBy(_.filter(this.regiones, r => {
				if (p(r.nombre).includes(busqueda)) return true
			}), r => r.nombre)
		},
	},
	mounted () {}
}
</script>
<style lang="sass" scoped>
@import '@style/vars'

.regiones
	.region
		margin-top: 1em
		.nombre
			+fwb
			color: black


</style>
