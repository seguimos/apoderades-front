<template lang="pug">
.root
	a-breadcrumb(:routes='rutas')
		template(slot='itemRender' slot-scope='{route, params, routes, paths}')
			n-link(:to="`/${paths.join('/')}`") {{route.breadcrumbName}}

	a-page-header.headerPagina(
		:title="region.nombreCompleto"
		sub-title="Región")

	.filtros
		a-input(v-model="busqueda" allow-clear placeholder='Nombre')
	.comunas
		.comuna(v-for="comuna in comunasFiltradas")
			n-link(:to="`/app/Chile/${regionID}/${comuna.comunaID}`")
				.nombre {{comuna.nombre}}

</template>
<script>
export default {
	data () {
		return {
			busqueda: ''
		}
	},
	computed: {
		rutas () { 
			if (!this.region) return []
			return [
				{
					path: `/app/Chile`,
					breadcrumbName: 'Chile',
				}
			] 
		},
		regionID () { return this.$route.params.regionID },
		region () { return this.$chile.regionPorID(this.regionID) },
		comunas () { return this.region.comunas },
		comunasFiltradas () { 
			const _ = this._
			const p = this.$p
			if (_.isEmpty(this.busqueda)) return this.comunas
			const busqueda = this.$p(this.busqueda)
			return _.orderBy(_.filter(this.comunas, c => {
				if (p(c.nombre).includes(busqueda)) return true
			}), c => c.nombre)
		},
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
@import '@style/vars'

.comunas
	.comuna
		margin-top: 1em
		.nombre
			+fwb
			color: black
</style>