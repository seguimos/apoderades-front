<template lang="pug">
.root(v-if="regionID && comunaID && localID")
	a-breadcrumb(:routes='rutas')
		template(slot='itemRender' slot-scope='{route, params, routes, paths}')
			n-link(:to="`/${paths.join('/')}`") {{route.breadcrumbName}}

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
			return [
				{
					path: `/app/Chile`,
					breadcrumbName: 'Chile',
				},
				{
					path: this.regionID,
					breadcrumbName: _.get(this.region, 'nombre', 'Region?'),
				},
				{
					path: this.comunaID,
					breadcrumbName: _.get(this.comuna, 'nombre', 'Comuna?'),
				}
			] 
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
