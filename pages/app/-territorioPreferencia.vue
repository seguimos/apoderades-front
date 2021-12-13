<template lang="pug">
.asignadorTerritorio.anchoMovil
	.cabecera
		b Antes de continuar, por favor
		h1 Selecciona tu local de votación 

	.modosAsignacion

	.asignadores
		a-form-model.asignadores(ref="asignacionTerritorialForm" :model="asignacionTerritorialForm" :rules="reglasFormAsignacionTerritorial")

			mixin selectorComuna
				a-form-model-item(has-feedback prop="comunaID" label="Comuna")

					a-auto-complete.certain-category-search(dropdown-class-name='certain-category-search-dropdown' :dropdown-match-select-width='false' :dropdown-style="{ width: '300px' }" size='large' style='width: 100%' placeholder='Escribe parte del nombre de la comuna' @search="filtrarSugerenciasComunas" @select="elegirComuna" allow-clear)
						template(slot='dataSource')
							a-select-opt-group(v-for='(region, regionID) in comunasSugeridasPorBusqueda' :key='`reg-${regionID}`')
								span(slot='label')
									| {{ region.nombre }}
									//- a(style='float: right' href='https://www.google.com/search?q=antd' target='_blank' rel='noopener noreferrer') more
								a-select-option(v-if="!_.isEmpty(region.comunas)" v-for='(comuna, comunaID) in region.comunas' :key='`comuna-${comunaID}`' :value='comunaID')
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
							a-select-option(v-if="!_.isEmpty(localesSugeridosPorBusqueda)" v-for='(local, localID) in localesSugeridosPorBusqueda' :key='`local-${localID}`' :value='localID')
								| {{ local.nombre }}
								//- span.certain-search-item-count {{ comuna.count }} people
						a-input
							//a-icon.certain-category-icon(slot='suffix' type='search')

				a-form-model-item.acciones
					a-button.w100.bpStyle.verde(type="primary" @click="elegirTerritorio") Guardar
				a-button.w100.casiBpStyle(type="dashed" @click='$cuentaBack.preferenciaSaltada = true') Saltar

</template>
<script>
import { regionesYSusComunas, regionIDDeComuna } from '@lib/regioneschile'
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
			busquedaLocal: ''
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
		localesAsignables () {
			const locales = this.localesPorComuna
			const comunaElegida = this.asignacionTerritorialForm.comunaID
			if (comunaElegida) return locales[comunaElegida]
			return Object.assign({}, ...Object.values(locales))
		},
		comunasSugeridasPorBusqueda () {
			const _ = this._
			const buscado = parameterize(this.busquedaComuna)
			console.log('buscado', buscado)
			if (_.isEmpty(buscado)) return regionesYSusComunas

			let comunasFiltradas = Object.assign({}, regionesYSusComunas)
			_.forEach(comunasFiltradas, (region, regionID) => {
				comunasFiltradas[regionID].comunas = _.pickBy(region.comunas, comuna => parameterize(comuna.nombre).includes(buscado))
			})
			comunasFiltradas = _.filter(comunasFiltradas, region => !_.isEmpty(region.comunas))

			return comunasFiltradas
		},
		localesSugeridosPorBusqueda () {
			const _ = this._
			const buscado = parameterize(this.busquedaLocal)
			console.log('buscado', buscado)
			if (_.isEmpty(buscado)) return this.localesAsignables
			let localesFiltrados = Object.assign({}, this.localesAsignables)
			localesFiltrados = _.pickBy(localesFiltrados, local => parameterize(local.nombre).includes(buscado))
			return localesFiltrados
		}
	},
	methods: {
		filtrarSugerenciasComunas (buscado) {
			this.busquedaComuna = buscado
		},
		filtrarSugerenciasLocales (buscado) {
			this.busquedaLocal = buscado
		},
		elegirComuna (comunaID) {
			console.log('elegirComuna', comunaID)
			this.asignacionTerritorialForm.comunaID = comunaID
			const regionID = regionIDDeComuna(comunaID)
			if (this.asignacionTerritorialForm.regionID !== regionID) this.asignacionTerritorialForm.regionID = regionID
			this.$refs.asignacionTerritorialForm.validate()
			this.buscarLocales(regionID, comunaID)
		},
		elegirLocal (localID) {
			console.log('elegirLocal', localID)
			this.asignacionTerritorialForm.localID = localID
			this.$refs.asignacionTerritorialForm.validate()
		},
		elegirTerritorio () {
			this.$refs.asignacionTerritorialForm.validate(async valid => {
				if (!valid) {
					console.error('Formulario no pasó validación')
					return
				}
				const { regionID, comunaID, localID } = this.asignacionTerritorialForm
				const resultado = await this.$cuentaBack.guardarTerritorioPreferencia({ regionID, comunaID, localID })
				console.log('elegirTerritorio', resultado)
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
.modosAsignacion
	margin-bottom: 3em
.descripcionAsignacion
	line-height: 1.4
</style>
