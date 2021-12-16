<template lang="pug">
.root
	a-breadcrumb(:routes='rutas')
		template(slot='itemRender' slot-scope='{route, params, routes, paths}')
			span(v-if='routes.indexOf(route) === routes.length - 1') {{route.breadcrumbName}}
			n-link(v-else :to="`/${paths.join('/')}`") {{route.breadcrumbName}}

	a-page-header.headerPagina(
		:title="region.nombreCompleto"
		sub-title="Región")

	.comunas
		.comuna(v-for="comuna in _.orderBy(_.values(region.comunas), c => c.nombre)")
			n-link(:to="`/app/Chile/${regionID}/${comuna.comunaID}`")
				.nombre {{comuna.nombre}}


	h1 Proto
	div regionID {{regionID}}
	

</template>
<script>
export default {
	computed: {
		rutas () { 
			if (!this.region) return []
			return [
				{
					path: `/app/Chile`,
					breadcrumbName: 'Chile',
				},
				{
					path: this.regionID,
					breadcrumbName: this.region.nombre,
				},
			] 
		},
		regionID () { return this.$route.params.regionID },
		region () { return this.$chile.regionPorID(this.regionID)},
	},
	mounted () {},
	methods: {
		cargarLocal () {
			if (!this.regionID || !this.localID) return
			this.$cuentaBack.localPorID(this.regionID, this.localID)
		}
	}
}
</script>
<style lang="sass" scoped>
//.headerPagina
	display: block
</style>