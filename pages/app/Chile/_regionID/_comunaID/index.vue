<template lang="pug">
.root
	a-breadcrumb(:routes='rutas')
		template(slot='itemRender' slot-scope='{route, params, routes, paths}')
			span(v-if='routes.indexOf(route) === routes.length - 1') {{route.breadcrumbName}}
			n-link(v-else :to="`/${paths.join('/')}`") {{route.breadcrumbName}}

	a-page-header.headerPagina(
		:title="comuna.nombre"
		sub-title="Comuna")

	.comunas
		.comuna(v-for="local in _.orderBy(_.values(locales), l => l.nombre)")
			n-link(:to="`/app/Chile/${regionID}/${comunaID}/${local.localID}`")
				.nombre {{local.nombre}}


	h1 Proto
	div comunaID {{comunaID}}
	

</template>
<script>
export default {
	computed: {
		rutas () { 
			if (!this.region || !this.comuna) return false
			return [
				{
					path: `/app/Chile`,
					breadcrumbName: 'Chile',
				},
				{
					path: this.regionID,
					breadcrumbName: this.region.nombre,
				},
				{
					path: this.comunaID,
					breadcrumbName: this.comuna.nombre,
				},
			] 
		},
		regionID () { return this.$route.params.regionID },
		region () { return this.$chile.regionPorID(this.regionID)},
		comunaID () { return this.$route.params.comunaID },
		comuna () { return this.$chile.comunaPorID(this.comunaID)},
		locales () { return this._.filter(this.$store.state.locales, l => l.comunaID === this.comunaID)},
	},
	mounted () {
		this.cargarLocalesComuna()
	},
	methods: {
		cargarLocalesComuna () {
			console.log('cargarLocalesComuna')
			const regionID = this.regionID
			const comunaID = this.comunaID
			if (!regionID || !comunaID) return
			console.log('cargarLocalesComuna', regionID, comunaID)
			this.$cuentaBack.localesXComuna({ region: regionID, comunaCodigo: comunaID })
		}
	}
}
</script>
<style lang="sass" scoped>
//.headerPagina
	display: block
</style>