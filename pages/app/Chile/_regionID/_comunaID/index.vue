<template lang="pug">
.root
	a-breadcrumb(:routes='rutas')
		template(slot='itemRender' slot-scope='{route, params, routes, paths}')
			n-link(:to="`/${paths.join('/')}`") {{route.breadcrumbName}}

	a-page-header.headerPagina(
		:title="comuna.nombre"
		sub-title="Comuna")

		.estadisticas.flex.aic.jcsb(v-if="estadisticas")
			a-statistic(decimalSeparator="," groupSeparator="." title="Locales" :value="estadisticas.locales")
			a-statistic(decimalSeparator="," groupSeparator="." title="Mesas" :value="estadisticas.mesas")
			a-statistic(decimalSeparator="," groupSeparator="." title="Apoderados" :value="estadisticas.apoderades")




	.zonaLocales
		h2 Locales de votación
		.filtros
			a-input(v-model="busqueda" allow-clear placeholder='Nombre o dirección')
		.locales
			n-link.local(:to="`/app/Chile/${regionID}/${comunaID}/${local.localID}`" 
				v-for="local in _.orderBy(_.values(localesFiltrados), l => l.nombre)")
				.info
					h3.nombre 🗳 {{local.nombre}}
					.direccion {{local.direccion.split(', ').slice(0, -2).join(', ')}}
				.estadisticas.flex.aic.jcsa(v-if="local.estadisticas")
					a-statistic(decimalSeparator="," groupSeparator="." title="Mesas" 
					:value="_.get(local, ['estadisticas', 'mesas'])")
					a-statistic(decimalSeparator="," groupSeparator="." title="Apoderados" 
					:value="_.get(local, ['estadisticas', 'apoderades'])")

</template>
<script>
export default {
	data () {
		return {
			busqueda: '',
			estadisticas: null
		}
	},
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
		puedeDesignarCoordinacionComunal () {
			return this.$apoderade.tieneAccesoNacional || this._.some(this.$apoderade.asignaciones, a => a.capa === 'regional' && a.regionID === this.regionID)
		}
	},
	mounted () {
		if (!this.estadisticas) this.cargarComuna()
		// this.cargarLocalesComuna()
	},
	methods: {
		cargarLocalesComuna () {
			console.log('cargarLocalesComuna')
			const regionID = this.regionID
			const comunaID = this.comunaID
			if (!regionID || !comunaID) return
			console.log('cargarLocalesComuna', regionID, comunaID)
			this.$cuentaBack.localesXComuna({ regionID, comunaID })
		},
		async cargarComuna () {
			const fx = 'chile.comuna cargarComuna'
			const _ = this._
			if (!this.regionID || !this.regionID) return
			const r = await this.$cuentaBack.localesXComuna({ regionID: this.regionID, comunaID: this.comunaID })
			if (!r || !r.ok) {
				console.error(fx, r)
				return
			}
			this.estadisticas = {
				locales: (r.locales || []).length,
				mesas: _.reduce((r.locales || []), (res, local) =>{
					if (!_.get(local, 'estadisticas', 'mesas')) return res
					return res + local.estadisticas.mesas
				}, 0),
				apoderades: _.reduce((r.locales || []), (res, local) =>{
					if (!_.get(local, 'estadisticas', 'numeroApoderades')) return res
					if (local.estadisticas.apoderades) console.info('local.estadisticas.apoderades', local)
					return res + local.estadisticas.apoderades
				}, 0)
			}
		}
	}
}
</script>
<style lang="sass" scoped>
@import '@style/vars'


.comunas
	.comuna
		margin-top: 2em
		background-color: #eee
		+radio
		padding: .5em 1em
		.nombre
			+fwb
			color: black
			margin: 0
			margin-bottom: .5em

.locales
	.local
		display: block
		margin-top: 2em
		background-color: #eee
		+radio
		padding: .5em
		.info
			margin-bottom: 1em
			.nombre
				display: inline-block
				color: black
				+fwb
				margin: 0
			.direccion
				opacity: 1
				
</style>