<template lang="pug">
.asignadorTerritorio

	.asignadores
		a-form-model.asignadores(ref="asignacionTerritorialForm" :model="asignacionTerritorialForm" :rules="reglasFormAsignacionTerritorial")

			mixin selectorComuna
				a-form-model-item(has-feedback prop="comuna" label="Comuna")

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

			.asignadorLocal(v-if="['general', 'mesa'].includes(tipoAsignacion)")
				p.descripcionAsignacion(v-if="tipoAsignacion === 'general'") El apoderado podrá gestionar a otros apoderados dentro del local de votación asignado.
				//- p.descripcionAsignacion(v-if="tipoAsignacion === 'mesa'") El apoderado podrá gestionar a otros apoderados dentro de la región.
				+selectorComuna
				a-form-model-item(has-feedback prop="local" label="Local")
					a-auto-complete.certain-category-search(dropdown-class-name='certain-category-search-dropdown' :dropdown-match-select-width='false' :dropdown-style="{ width: '300px' }" size='large' style='width: 100%' placeholder='Escribe parte del nombre del local' @search="filtrarSugerenciasLocales" @select="elegirLocal" allow-clear)
						template(slot='dataSource')
							a-select-option(v-if="!_.isEmpty(localesSugeridosPorBusqueda)" v-for='(local, localID) in localesSugeridosPorBusqueda' :key='`local-${localID}`' :value='localID')
								| {{ local.nombre }}
								//- span.certain-search-item-count {{ comuna.count }} people
						a-input
							//a-icon.certain-category-icon(slot='suffix' type='search')

			.asignadorComuna(v-if="tipoAsignacion === 'comunal'")
				p.descripcionAsignacion El coordinador podrá gestionar a otros apoderados dentro de la comuna.
				+selectorComuna

			.asignadorRegion(v-if="tipoAsignacion === 'regional'")
				p.descripcionAsignacion El apoderado podrá gestionar a otros coordinadores y apoderados dentro de la región.
				a-form-model-item(has-feedback prop="region" label="Región")
					a-select.input(v-model="asignacionTerritorialForm.region" @change="elegirRegion" placeholder="Región")
						a-select-option(v-for="(region, regionID) in regionesAsignables" :key="`region-${regionID}`" :value="regionID") {{ region.nombre }}


			a-form-model-item
				a-button.w100.casiBpStyle(type="primary" @click="$emit('cancelar')") Cancelar
				a-button.w100.casiBpStyle(@click="asignarTerritorio") Asignar
</template>
<script>
import parameterize from '@lib/parameterize'
export default {
	props: {
		usuarioID: {
			type: String,
			required: true
		},
		tipoAsignacion: {
			type: String,
			required: true
		}
	},
	data () {
		return {
			asignacionTerritorialForm: {
				region: undefined,
				comuna: undefined,
				local: undefined,
			},
			localesPorComuna: {},
			busquedaComuna: '',
			busquedaLocal: ''
		}
	},
	computed: {
		reglasFormAsignacionTerritorial () {
			if (this.tipoAsignacion === 'regional') {
				return {
					region: [{ required: true, message: '*', whitespace: true, trigger: 'blur' }],
				}
			} else if (this.tipoAsignacion === 'comunal') {
				return {
					region: [{ required: true, message: '*', whitespace: true, trigger: 'blur' }],
					comuna: [{ required: true, message: '*', whitespace: true, trigger: 'blur' }],
				}
			}
			return {
				region: [{ required: true, message: '*', whitespace: true, trigger: 'blur' }],
				comuna: [{ required: true, message: '*', whitespace: true, trigger: 'blur' }],
				local: [{ required: true, message: '*', whitespace: false, trigger: 'blur' }],
			}
		},
		regionesAsignables () {
			if (this.$apoderade.tieneAccesoNacional) return this.$chile.regionesYSusComunas
			const regionesAlcanzadas = this.$apoderade.territorios && this.$apoderade.territorios.map(t => t.region)
			return regionesAlcanzadas && this._.pickBy(this.$chile.regionesYSusComunas, (r, regionID) => regionesAlcanzadas.includes(regionID))
		},
		comunasEnRegionesAsignables () {
			const _ = this._
			const regionesAsignables = Object.assign({}, this.regionesAsignables)
			_.forEach(regionesAsignables, (region, regionID) => {
				if (this.$apoderade.tieneAccesoNacional) return
				const territoriosAsignables = _.pickBy(this.$apoderade.territorios, t => t.region === regionID)
				const comunaIDs = _.map(territoriosAsignables, t=> t.comunaCodigo)
				regionesAsignables[regionID].comunas = _.pick(region.comunas, comunaIDs)
			})
			return regionesAsignables
		},
		comunasAsignables () {
			const _ = this._
			const regionesAsignables = this.regionesAsignables
			let comunasAsignables = Object.assign({}, ...(_.map(regionesAsignables, r => r.comunas)))
			const idRegionElegida = this.asignacionTerritorialForm.region
			if (idRegionElegida) {
				if (regionesAsignables[idRegionElegida]) return []
				comunasAsignables = this.$chile.comunasEnUnaRegion(idRegionElegida)
			}
			// Revisar a qué comunas tiene alcance el inscriptor
			if (this.$apoderade.tieneAccesoNacional) return comunasAsignables
			const territoriosAsignables = _.pickBy(this.$apoderade.territorios, t => {
				if (idRegionElegida && t.region === idRegionElegida) return [false]
				return true
			})
			if (_.some(territoriosAsignables, t => !t.comunaCodigo)) return comunasAsignables
			const comunaCodigosAsignables = _.map(territoriosAsignables, t => t.comunaCodigo)
			
			return this._.pickBy(comunasAsignables, (c, comunaID) => comunaCodigosAsignables.includes(comunaID))
		},
		localesAsignables () {
			const locales = this.localesPorComuna
			const comunaElegida = this.asignacionTerritorialForm.comuna
			if (comunaElegida) return locales[comunaElegida]
			return Object.assign({}, ...Object.values(locales))
		},
		comunasSugeridasPorBusqueda () {
			const _ = this._
			const buscado = parameterize(this.busquedaComuna)
			console.log('buscado', buscado)
			if (_.isEmpty(buscado)) return this.comunasEnRegionesAsignables
			let comunasFiltradas = Object.assign({}, this.comunasEnRegionesAsignables)
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
		elegirRegion (regionID) {
			console.log('elegirRegion', regionID)
			this.asignacionTerritorialForm.region = regionID
		},
		elegirComuna (comunaID) {
			console.log('elegirComuna', comunaID)
			this.asignacionTerritorialForm.comuna = comunaID
			const regionID = this.$chile.regionIDDeComuna(comunaID)
			if (this.asignacionTerritorialForm.region !== regionID) this.asignacionTerritorialForm.region = regionID
			this.$refs.asignacionTerritorialForm.validate()
			this.buscarLocales(regionID, comunaID)
		},
		elegirLocal (localID) {
			console.log('elegirLocal', localID)
			this.asignacionTerritorialForm.local = localID
			this.$refs.asignacionTerritorialForm.validate()
		},
		asignarTerritorio () {
			const tipoAsignacion = this.tipoAsignacion
			this.$refs.asignacionTerritorialForm.validate(async valid => {
				if (!valid) {
					console.error('Formulario no pasó validación')
					return
				}
				const { region: regionID, comuna: comunaID, local: localID } = this.asignacionTerritorialForm
				let resultado
				const usuarioID = this.usuarioID
				if (tipoAsignacion === 'regional') {
					resultado = await this.$cuentaBack.asignarTerritorio({ usuarioID, regionID })
				} else if (tipoAsignacion === 'comunal') {
					resultado = await this.$cuentaBack.asignarTerritorio({ usuarioID, regionID, comunaID })
				} else if (tipoAsignacion === 'general') {
					resultado = await this.$cuentaBack.asignarTerritorio({ usuarioID, regionID, comunaID, localID, esApoGeneral: true })
				} else if (tipoAsignacion === 'mesa') {
					resultado = await this.$cuentaBack.asignarTerritorio({ usuarioID, regionID, comunaID, localID })
				} else resultado = 'No funciona así'
				console.log('asignarTerritorio', resultado)
				this.$emit('asignacionRealizada')
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
