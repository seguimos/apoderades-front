<template lang="pug">
.root
	a-breadcrumb(:routes='rutas')
		template(slot='itemRender' slot-scope='{route, params, routes, paths}')
			n-link(:to="`/${paths.join('/')}`") {{route.breadcrumbName}}

	a-page-header.headerPagina(
		:title="comuna.nombre"
		sub-title="Comuna")

	.locales
		.local(v-for="local in _.orderBy(_.values(locales), l => l.nombre)")
			
				.zonaIcono
					.icono 🗳
				.info
					n-link.nombre(:to="`/app/Chile/${regionID}/${comunaID}/${local.localID}`") {{local.nombre}}
					.direccion {{local.direccion.split(', ').slice(0, -2).join(', ')}}


	h1 Proto
	div comunaID {{comunaID}}
	

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
				}
			] 
		},
		regionID () { return this.$route.params.regionID },
		region () { return this.$chile.regionPorID(this.regionID)},
		comunaID () { return this.$route.params.comunaID },
		comuna () { return this.$chile.comunaPorID(this.comunaID)},
		locales () { return this._.filter(this.$store.state.locales, l => l.comunaID === this.comunaID)},
		localesFiltrados () { 
			const _ = this._
			const p = this.$p
			if (_.isEmpty(this.busqueda)) return this.locales
			const busqueda = this.$p(this.busqueda)
			return _.filter(this.locales, l => {
				if (p(l.nombre).includes(busqueda)) return true
				if (p(l.direccion).includes(busqueda)) return true
			})
		},
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
@import '@style/vars'
//.headerPagina
	display: block

.locales
	.local
		display: flex
		align-items: center
		// border: 1px solid #aaa
		// padding: 1em
		margin-top: 1em
		.zonaIcono
			flex: auto 0 0
			line-height: 0
			margin-right: 1em
			.icono
				font-size: 3em
		.info
			flex: auto 1 1
			.nombre
				display: inline-block
				// border: 1px solid red
				+fwb
			.direccion
				opacity: .7
</style>