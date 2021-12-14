<template lang="pug">
.asignadorTerritorio.anchoMovil
	.cabecera
		b Antes de continuar, por favor, indica
		h1 Tu local de votación 

	.modosAsignacion

	.asignadores
		a-form-model.asignadores(ref="asignacionTerritorialForm" :model="asignacionTerritorialForm" :rules="reglasFormAsignacionTerritorial")

			mixin selectorComuna
				a-form-model-item(has-feedback prop="comunaID" label="Comuna")

					a-auto-complete.certain-category-search(dropdown-class-name='certain-category-search-dropdown' :dropdown-match-select-width='false' :dropdown-style="{ width: '300px' }" size='large' style='width: 100%' placeholder='Escribe parte del nombre de la comuna' @search="filtrarSugerenciasComunas" @select="elegirComuna" allow-clear)
						template(slot='dataSource')
							a-select-opt-group(v-for='region in comunasSugeridasPorBusqueda' :key='`reg-${region.regionID}`')
								span(slot='label')
									| {{ region.nombre }}
									//- a(style='float: right' href='https://www.google.com/search?q=antd' target='_blank' rel='noopener noreferrer') more
								a-select-option(v-if="!_.isEmpty(region.comunas)" v-for='(comuna, comunaID) in region.comunas' :key='`reg-${region.regionID}-comuna-${comunaID}`' :value='comunaID')
									| {{ comuna.nombre }}
									//- span.certain-search-item-count {{ comuna.count }} people
							//- a-select-option.show-all(key='all' disabled='')
								a(href='https://www.google.com/search?q=ant-design-vue' target='_blank' rel='noopener noreferrer') View all results
						a-input
							//a-icon.certain-category-icon(slot='suffix' type='search')

			.asignadorLocal
				+selectorComuna
				a-form-model-item(has-feedback prop="localID" label="Local de votación")
					a-auto-complete.certain-category-search(dropdown-class-name='certain-category-search-dropdown' :dropdown-match-select-width='false' :dropdown-style="{ width: '300px' }" size='large' style='width: 100%' placeholder='Escribe parte del nombre del local' @search="filtrarSugerenciasLocales" @select="elegirLocal" allow-clear)
						template(slot='dataSource')
							a-select-option(v-if="!_.isEmpty(localesSugeridosPorBusqueda)" v-for='local in localesSugeridosPorBusqueda' :key='`local-${local.localID}`' :value='local.localID')
								| {{ local.nombre }}
								//- span.certain-search-item-count {{ comuna.count }} people
						a-input
							//a-icon.certain-category-icon(slot='suffix' type='search')

				a-form-model-item.acciones
					a-button.w100.bpStyle.verde(type="primary" @click="guardarLocalDeVotacion") Guardar
				a-button.w100.casiBpStyle(type="dashed" @click='$cuentaBack.preferenciaSaltada = true') Saltar

</template>
<script>
import parameterize from '@lib/parameterize'
export default {
	data () {
		return {
			// Asignacion territorial
			asignacionTerritorialForm: {
				regionID: undefined,
				comunaID: undefined,
				localID: undefined
			},
			localesPorComuna: {},
			busquedaComuna: '',
			busquedaLocal: '',
			comunasSugeridasPorBusqueda: [],
			localesSugeridosPorBusqueda: []
		}
	},
	computed: {
		reglasFormAsignacionTerritorial () {
			return {
				region: [{ required: true, message: '*', whitespace: true, trigger: 'blur' }],
				comuna: [{ required: true, message: '*', whitespace: true, trigger: 'blur' }],
				local: [{ required: true, message: '*', whitespace: false, trigger: 'blur' }],
			}
		},
		localesComuna () {
			const locales = this.$store.state.locales
			const comunaElegida = this.asignacionTerritorialForm.comunaID
			if (!comunaElegida) return locales
			const filtrados = this._.pickBy(locales, local=> this._.get(local, 'ubicacion.comunaCodigo') === comunaElegida)
			return filtrados
		},
		todasLasRegionesYsusComunas () {return this.$chile.todasLasRegionesYsusComunas()},
		localesSugeridosPorBusqddddddddddddueda () {
			const _ = this._
			const buscado = parameterize(this.busquedaLocal)
			console.log('buscado', buscado)
			if (_.isEmpty(buscado)) return this.localesComuna
			let localesFiltrados = Object.assign({}, this.localesComuna)
			localesFiltrados = _.pickBy(localesFiltrados, local => parameterize(local.nombre).includes(buscado))
			return localesFiltrados
		}
	},
	methods: {
		filtrarSugerenciasComunas (buscado) {
			console.log('filtrarSugerenciasComunas', buscado)
			this.busquedaComuna = buscado

			const _ = this._
			const q = parameterize(buscado)
			console.log('query:', q)
			if (_.isEmpty(q)) return this.todasLasRegionesYsusComunas

			const filtrables = Object.assign({x:1}, this.todasLasRegionesYsusComunas)

			// const filtradas = _.reduce(filtrables, (resultado, region, regionID) => {
			this.comunasSugeridasPorBusqueda = _.reduce(filtrables, (resultado, region, regionID) => {
				const comunasCalzantes = _.pickBy(region.comunas, comuna => parameterize(comuna.nombre).includes(q))
				if (_.isEmpty(comunasCalzantes)) return resultado
				resultado.push(Object.assign({regionID, nombre: region.nombre}, {comunas: comunasCalzantes}))
				return resultado
			}, [])
		},
		filtrarSugerenciasLocales (buscado) {
			console.log('filtrarSugerenciasLocales', buscado)
			this.busquedaLocal = buscado

			const _ = this._
			const q = parameterize(buscado)
			console.log('query', q)
			const comunaElegida = this.asignacionTerritorialForm.comunaID
			if (!comunaElegida) return
			const todosLosLocales = this.$store.state.locales
			this.localesSugeridosPorBusqueda = _.reduce(todosLosLocales, (resultado, local, localID) => {
				if (parameterize(local.nombre).includes(q)) resultado.push({...local, localID})
				return resultado
			}, [])
		},
		elegirComuna (comunaID) {
			console.log('elegirComuna', comunaID)
			this.asignacionTerritorialForm.comunaID = comunaID
			const regionID = this.$chile.regionIDporComunaID(comunaID)
			if (this.asignacionTerritorialForm.regionID !== regionID) this.asignacionTerritorialForm.regionID = regionID
			this.$refs.asignacionTerritorialForm.validate()
			this.buscarLocales(regionID, comunaID)
		},
		elegirLocal (localID) {
			console.log('elegirLocal', localID)
			this.asignacionTerritorialForm.localID = localID
			this.$refs.asignacionTerritorialForm.validate()
		},
		guardarLocalDeVotacion () {
			this.$refs.asignacionTerritorialForm.validate(async valid => {
				if (!valid) {
					console.error('Formulario no pasó validación')
					return
				}
				const { regionID, comunaID, localID } = this.asignacionTerritorialForm
				const resultado = await this.$cuentaBack.guardarLocalDeVotacion({ regionID, comunaID, localID })
				console.log('guardarLocalDeVotacion', resultado)
				return resultado
			})
		},

		async buscarLocales (regionID, comunaID) {
			const r = await this.$cuentaBack.localesXComuna({
				region: regionID,
				comunaCodigo: comunaID
			})
			if (!r) return
			const locales = this._.reduce(r.locales, (locs, local) => {
				locs[local._id] = local
				delete locs[local._id]._id
				return locs
			}, {})
			console.log('buscarLocales', locales)
			const localesPorComuna = Object.assign({}, this.localesPorComuna)
			localesPorComuna[comunaID] = locales
			this.localesPorComuna = localesPorComuna
		},
	}
}
</script>
<style lang="sass" scoped>
.cabecera
	padding-top: 4em
	h1
		margin: 0 0 1rem	
.modosAsignacion
	margin-bottom: 3em
.descripcionAsignacion
	line-height: 1.4
</style>
