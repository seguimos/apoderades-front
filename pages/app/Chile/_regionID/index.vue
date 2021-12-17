<template lang="pug">
.root
	a-breadcrumb(:routes='rutas')
		template(slot='itemRender' slot-scope='{route, params, routes, paths}')
			n-link(:to="`/${paths.join('/')}`") {{route.breadcrumbName}}

	a-page-header.headerPagina(
		:title="region.nombreCompleto"
		sub-title="Región")
		
		.estadisticas(v-if="estadisticas")
			a-statistic(decimalSeparator="," groupSeparator="." title="Locales" :value="estadisticas.locales")
			a-statistic(decimalSeparator="," groupSeparator="." title="Mesas" :value="estadisticas.mesas")
			a-statistic(decimalSeparator="," groupSeparator="." title="Apoderados" :value="estadisticas.apoderades")

	//div
		a-button.w100(@click="$cuentaBack.localesXRegion(regionID)") Cargar locales de región

	.zonaComunas
		h2 Comunas
		.filtros
			a-input(v-model="busqueda" allow-clear placeholder='Busca comuna por nombre')
		.comunas
			.comuna(v-for="comuna in comunasFiltradas")
				n-link(:to="`/app/Chile/${regionID}/${comuna.comunaID}`")
					h3.nombre {{comuna.nombre}}

					.estadisticas(v-if="_.get(estadisticasComunas, [comuna.comunaID])")
						a-statistic(decimalSeparator="," groupSeparator="." title="Locales" 
						:value="_.get(estadisticasComunas, [comuna.comunaID, 'locales'])")
						a-statistic(decimalSeparator="," groupSeparator="." title="Mesas" 
						:value="_.get(estadisticasComunas, [comuna.comunaID, 'mesas'])")
						a-statistic(decimalSeparator="," groupSeparator="." title="Apoderados" 
						:value="_.get(estadisticasComunas, [comuna.comunaID, 'apoderades'])")

</template>
<script>
export default {
	data () {
		return {
			busqueda: '',
			estadisticas: null,
			estadisticasComunas: null
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
			if (_.isEmpty(this.busqueda)) return _.orderBy(Object.values(this.comunas), c => c.nombre)
			const busqueda = this.$p(this.busqueda)
			return _.orderBy(_.filter(Object.values(this.comunas), c => p(c.nombre).includes(busqueda)), c => c.nombre)
		},
		puedeAsignarCoordinacionRegional () {
			return this.$apoderade.tieneAccesoNacional
		},
	},
	mounted () {
		if (!this.estadisticas) this.cargarRegion()
	},
	methods: {
		async cargarRegion () {
			const fx = 'chile.region cargarRegion'
			const _ = this._
			if (!this.regionID || !this.regionID) return
			const r = await this.$cuentaBack.localesXRegion(this.regionID)
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
					return res + local.estadisticas.apoderades
				}, 0)
			}
			const estadisticasComunas = {}
			_.forEach(r.locales, local => {
				const comunaID = _.get(local, ['ubicacion', 'comunaCodigo'])
				if (!comunaID) {
					console.error(fx, 'falta comunaID', {comunaID, local})
					return
				}
				estadisticasComunas[comunaID] = estadisticasComunas[comunaID] || {}
				estadisticasComunas[comunaID] = {
					locales: 1 + _.get(estadisticasComunas, [comunaID, 'locales'], 0),
					mesas: _.get(local, ['estadisticas', 'mesas']) + _.get(estadisticasComunas, [comunaID, 'mesas'], 0),
					apoderades: _.get(local, ['estadisticas', 'apoderades']) + _.get(estadisticasComunas, [comunaID, 'apoderades'], 0) 
				}
			});

			this.estadisticasComunas = estadisticasComunas
		}
	}
}
</script>
<style lang="sass" scoped>
@import '@style/vars'
.estadisticas
	display: flex
	align-items: center
	justify-content: space-between
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
</style>