<template lang="pug">
.root
	a-breadcrumb(:routes='rutas')
		template(slot='itemRender' slot-scope='{route, params, routes, paths}')
			span(v-if='routes.indexOf(route) === routes.length - 1') {{route.breadcrumbName}}
			n-link(v-else :to="`/${paths.join('/')}`") {{route.breadcrumbName}}

	a-page-header.headerPagina(
		:title="local.nombre"
		sub-title="Local de votación")

	.local
		p aca va la info del local


</template>
<script>
export default {
	computed: {
		rutas () { 
			const _ = this._
			if (_.isEmpty(this.region) || _.isEmpty(this.comuna)) return []
			const rutas = [
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
				{
					path: this.localID,
					breadcrumbName: this.local ? this.local.nombre : 'Local',
				}
			] 
			return rutas
		},
		regionID () { return this.$route.params.regionID },
		region () { return this.$chile.regionPorID(this.regionID)},
		comunaID () { return this.$route.params.comunaID },
		comuna () { return this.$chile.comunaPorID(this.comunaID)},
		localID () { return this.$route.params.localID },
		local () { return this.$chile.localPorID(this.localID)},
	},
	mounted () {
		if (this._.isEmpty(this.local)) this.cargarLocal()
	},
	methods: {
		cargarLocal () {
			if (!this.regionID || !this.localID) return
			this.$cuentaBack.localPorID(this.regionID, this.localID)
		}
	}
}
</script>
<style lang="sass" scoped></style>
