<template lang="pug">
.asignadorTerritorio
	//- div
	//- 	strong regionesAsignablesIDs
	//- 	div {{regionesAsignablesIDs}}
	//- div
		strong comunasAsignablesIDs
		div {{comunasAsignablesIDs}}
	//- div
		strong localesAsignablesIDs
		div {{localesAsignablesIDs}}
	//- div
		strong comunasSugeridasPorBusqueda
		div {{comunasSugeridasPorBusqueda}}
	//- div
		strong localesSugeridosPorBusqueda
		div(v-for="local in localesSugeridosPorBusqueda") {{local}}

	.asignadores
		a-form-model.asignadores(ref="nuevaAsignacion" :model="nuevaAsignacion" :rules="reglasFormAsignacionTerritorial")

			mixin selectorComuna
				a-form-model-item(has-feedback prop="comunaID" label="Comuna")
					a-auto-complete.certain-category-search(
						dropdown-class-name='certain-category-search-dropdown'
						:dropdown-match-select-width='false'
						:dropdown-style="{ width: '300px' }" 
						size='large' 
						style='width: 100%' 
						placeholder='Escribe parte del nombre de la comuna' 
						@focus="filtrarSugerenciasComunas(busquedaComuna)" 
						@search="filtrarSugerenciasComunas" 
						@select="elegirComuna" 
						allow-clear)
						template(slot='dataSource')
							a-select-opt-group(v-for='region in comunasSugeridasPorBusqueda' :key='`reg-${region.regionID}`')
								span(slot='label')
									| {{ region.nombre }}
								a-select-option(v-if="!_.isEmpty(region.comunas)" v-for='comuna in region.comunas' :key='`comuna-${comuna.comunaID}`' :value='comuna.comunaID')
									| {{ comuna.nombre }}
						a-input

			.asignadorLocal(v-if="['general', 'mesa'].includes(tipoAsignacion)")
				
				p.descripcionAsignacion(v-if="tipoAsignacion === 'general'") El apoderado podrá gestionar a otros apoderados dentro del local de votación asignado.
				+selectorComuna

				a-form-model-item(has-feedback prop="localID")
					.flex.jcsb.aic(slot='label') 
						span Local de votación
						a-button(v-show="nuevaAsignacion.localID") Cambiar

					.hayLocalElegido(v-if="nuevaAsignacion.localID")
						miniTarjetaLocal(:local="$cuentaBack.reinstanciarAsignacion(nuevaAsignacion)")
							

					.noHayLocalElegido(v-else)

						a-input(ref="buscadorLocal" placeholder='Escribe parte del nombre del local' v-model="busquedaLocal" allow-clear @blur="$refs.nuevaAsignacion.validate()")
						.zonaOpciones
							div(v-if="busquedaLocal")
								a-alert(v-if="!nuevaAsignacion.comunaID" message="Antes de buscar, por favor elige comuna" banner) 
								a-empty(v-else-if="_.isEmpty(sugerenciasLocales)" )
								.opciones(v-else)
									.opcion(v-for='local in sugerenciasLocales' :key='`local-${local.localID}`'
										@click="elegirLocal(local.localID)")
										.nombre {{ local.nombre.toLowerCase() }}
										.direccion {{ local.direccion }}

			
			
			.asignadorComuna(v-if="tipoAsignacion === 'comunal'")
				p.descripcionAsignacion El coordinador podrá gestionar a otros apoderados dentro de la comuna.
				+selectorComuna

			.asignadorRegion(v-if="tipoAsignacion === 'regional'")
				p.descripcionAsignacion El apoderado podrá gestionar a otros coordinadores y apoderados dentro de la región.
				a-form-model-item(has-feedback prop="regionID" label="Región")
					a-select.input(v-model="nuevaAsignacion.regionID" @change="elegirRegion" placeholder="Región")
						a-select-option(v-for="region in regionesAsignablesIDs" :key="`region-${region.regionID}`" :value="region.regionID") {{ region.nombre }}


			a-form-model-item.acciones
				a-button.w100.casiBpStyle(type="primary" @click="asignarTerritorio") Asignar
				a-button.w100.casiBpStyle(@click="$emit('cancelar')" type="dashed") Cancelar
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
			nuevaAsignacion: {
				regionID: undefined,
				comunaID: undefined,
				localID: undefined,
				esApoGeneral: undefined,
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
			if (this.tipoAsignacion === 'regional') {
				return {
					regionID: [{ required: true, message: '*', whitespace: true, trigger: 'blur' }],
				}
			} else if (this.tipoAsignacion === 'comunal') {
				return {
					regionID: [{ required: true, message: '*', whitespace: true, trigger: 'blur' }],
					comunaID: [{ required: true, message: '* es necesaria', whitespace: true, trigger: 'blur' }],
				}
			}
			return {
				regionID: [{ required: true, message: '*', whitespace: true, trigger: 'blur' }],
				comunaID: [{ required: true, message: '* es necesaria', whitespace: true, trigger: 'blur' }],
				localID: [{ required: true, message: '* es necesario', whitespace: false, trigger: 'blur' }],
			}
		},
		regionesAsignablesIDs () {
			const _ = this._
			if (this.$apoderade.tieneAccesoNacional) return _.map(this.$chile.todasLasComunas(), r => r.regionID)
			const asignacionesRegionales = _.filter(this.$apoderade.asignaciones, a => a.capa === 'regional')
			const asignacionesRegionalesRegionIDs = _.flatten(_.map(asignacionesRegionales, a => Object.keys(a.comunas)))
			const asignacionesComunales = _.filter(this.$apoderade.asignaciones, a => a.capa === 'comunal')
			const asignacionesComunalesRegionIDs = _.map(asignacionesComunales, a => a.regionID)
			const asignacionesGenerales = _.filter(this.$apoderade.asignaciones, a => a.capa === 'general')
			const asignacionesGeneralesRegionIDs = _.map(asignacionesGenerales, a => a.regionID)
			const regionIDs = [ ...asignacionesRegionalesRegionIDs, ...asignacionesComunalesRegionIDs, ...asignacionesGeneralesRegionIDs]
			return _.uniq(regionIDs)
		},
		comunasAsignablesIDs () {
			const _ = this._
			if (this.$apoderade.tieneAccesoNacional) return _.map(this.$chile.todasLasComunas(), r => r.comunaID)
			const asignacionesRegionales = _.filter(this.$apoderade.asignaciones, a => a.capa === 'regional')
			const asignacionesRegionalesComunaIDs = _.flatten(_.map(asignacionesRegionales, a => Object.keys(a.comunas)))
			const asignacionesComunales = _.filter(this.$apoderade.asignaciones, a => a.capa === 'comunal')
			const asignacionesComunalesComunaIDs = _.map(asignacionesComunales, a => a.comunaID)
			const asignacionesGenerales = _.filter(this.$apoderade.asignaciones, a => a.capa === 'general')
			const asignacionesGeneralesComunaIDs = _.map(asignacionesGenerales, a => a.comunaID)
			const comunaIDs = [ ...asignacionesRegionalesComunaIDs, ...asignacionesComunalesComunaIDs, ...asignacionesGeneralesComunaIDs]
			return _.uniq(comunaIDs)
		},
		localesAsignablesIDs () {
			const _ = this._
			if (this.$apoderade.tieneAccesoNacional) return this.$chile.todosLosLocales()
			const localesAsignables = _.reduce(this.comunasAsignablesIDs, (pais, comuna, comunaID) => {
				return Object.assign({}, pais, this.$chile.localesPorComunaID(comunaID))
			}, {})
			return Object.keys(localesAsignables)
		},
		sugerenciasLocales () {
			const buscado = this.busquedaLocal
			console.log('sugerenciasLocales', buscado)
			const _ = this._
			const q = buscado && parameterize(buscado)
			if (this.$apoderade.tieneAccesoNacional) return this.$chile.todosLosLocales()
			const comunasAsignablesIDs = this.comunasAsignablesIDs
			const localesAsignables = _.reduce(comunasAsignablesIDs, (pais, comunaID) => {
				const localesComuna = this.$chile.localesPorComunaID(comunaID)
				return Object.assign({}, pais, localesComuna)
			}, {})
			const localesAsignablesIDs = _.uniq(Object.keys(localesAsignables))
			const comunaElegida = this.nuevaAsignacion.comunaID
			if (!comunaElegida) return []

			const locales = this.$chile.localesPorComunaID(comunaElegida)
			const asignables = this.$apoderade.tieneAccesoNacional? locales : _.filter(locales, local => localesAsignablesIDs.includes(local.localID))
			console.log('%c asignables', 'color: yellow', asignables)

			return _.reduce(asignables, (resultado, local) => {
				// Incluir si no se está buscando por texto o si es que hay match
				if (_.isEmpty(q) || parameterize(local.nombre).includes(q)) resultado.push(local)
				return resultado
			}, [])
		}
	},
	mounted () {
		this.filtrarSugerenciasComunas()
	},
	methods: {
		filtrarSugerenciasComunas (buscado) {
			console.log('filtrarSugerenciasComunas', buscado)
			this.busquedaComuna = buscado

			const _ = this._
			const q = parameterize(buscado)
			console.log('query:', q)
			const regiones = Object.values(this.$chile.todasLasRegionesYsusComunas())

			const asignables = this.$apoderade.tieneAccesoNacional? regiones : _.filter(regiones, r => this.regionesAsignablesIDs.includes(r.regionID))

			this.comunasSugeridasPorBusqueda = _.reduce(asignables, (resultado, region) => {
				const comunasCalzantes = _.pickBy(region.comunas, comuna => {
					if (!this.comunasAsignablesIDs.includes(comuna.comunaID)) return false
					if (q) return parameterize(comuna.nombre).includes(q)
					return true
				})
				if (_.isEmpty(comunasCalzantes)) return resultado
				resultado.push(Object.assign(region, {comunas: comunasCalzantes}))
				return resultado
			}, [])
		},
		elegirRegion (regionID) {
			console.log('elegirRegion', regionID)
			this.nuevaAsignacion.regionID = regionID
		},
		async elegirComuna (comunaID) {
			console.log('elegirComuna', comunaID)
			this.nuevaAsignacion.comunaID = comunaID
			this.nuevaAsignacion.regionID = this.$chile.regionIDporComunaID(comunaID)
			this.nuevaAsignacion.localID = null
			this.busquedaLocal = null
			
			await new Promise(resolve => this.$nextTick(() => resolve()))
			this.$refs.buscadorLocal.focus()
			this.buscarLocales(this.nuevaAsignacion.regionID, comunaID)
		},
		elegirLocal (localID) {
			console.log('elegirLocal', localID)
			this.nuevaAsignacion.localID = localID
			const local = this._.get(this.$store.state.locales, [localID])
			this.busquedaLocal = null
			const comunaID = local.comunaID
			console.log('elegirLocal comunaID =', comunaID)
			if (this.nuevaAsignacion.comunaID !== comunaID) this.elegirComuna(comunaID)
			this.$refs.nuevaAsignacion.validate()
		},
		asignarTerritorio () {
			const tipoAsignacion = this.tipoAsignacion
			this.$refs.nuevaAsignacion.validate(async valid => {
				if (!valid) {
					console.error('Formulario no pasó validación')
					return
				}
				const { regionID, comunaID, localID } = this.nuevaAsignacion
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
			await this.$cuentaBack.localesXComuna({ region: regionID, comunaCodigo: comunaID })
		},
	}
}
</script>
<style lang="sass" scoped>
@import "@style/vars"
.descripcionAsignacion
	line-height: 1.4
	font-style: italic
	opacity: .7
	padding: 1em
	margin-bottom: 2em


.asignadorLocal
	::v-deep
		.ant-form-item-required::before
			content: none
		//.noHayLocalElegido
			min-height: 20vh
		.opciones
			line-height: 1.4
		.opcion,
		.localElegido
			line-height: 1.4
			color: black
			margin-top: 1em
			border-radius: 4px
			padding: 1em
			background-color: white
			box-shadow: 0 0 .3em hsla(0, 0%, 0%, .2)
			&.localElegido
				box-shadow: none
				padding: 0
				text-align: center
			.nombre
				+fwn
				text-transform: capitalize

			.direccion
				+fwl
				opacity: .7

</style>
