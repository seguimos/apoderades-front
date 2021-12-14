<template lang="pug">
.asignadorTerritorio
	//- div
	//- 	strong regionesAsignables
	//- 	div {{regionesAsignables}}
	//- div
	//- 	strong comunasAsignables
	//- 	div {{comunasAsignables}}
	//- div
	//- 	strong localesAsignables
	//- 	div {{localesAsignables}}
	//div
		strong comunasSugeridasPorBusqueda
		div {{comunasSugeridasPorBusqueda}}
	//- div
		strong localesSugeridosPorBusqueda
		div(v-for="local in localesSugeridosPorBusqueda") {{local}}
	.asignadores
		a-form-model.asignadores(ref="asignacionTerritorialForm" :model="asignacionTerritorialForm" :rules="reglasFormAsignacionTerritorial")

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
				//- p.descripcionAsignacion(v-if="tipoAsignacion === 'mesa'") El apoderado podrá gestionar a otros apoderados dentro de la región.
				+selectorComuna
				a-form-model-item(has-feedback prop="localID" label="Local de votación")
					a-auto-complete.certain-category-search(dropdown-class-name='certain-category-search-dropdown' :dropdown-match-select-width='false' :dropdown-style="{ width: '300px' }" size='large' style='width: 100%' placeholder='Escribe parte del nombre del local' @focus="filtrarSugerenciasLocales(busquedaLocal)" @search="filtrarSugerenciasLocales" @select="elegirLocal" allow-clear)
						template(slot='dataSource')
							a-select-option(v-if="!_.isEmpty(localesSugeridosPorBusqueda)" v-for='local in localesSugeridosPorBusqueda' :key='`local-${local.localID}`' :value='local.localID')
								| {{ local.nombre }}
								//- span.certain-search-item-count {{ local.direccion }}
						a-input
							//a-icon.certain-category-icon(slot='suffix' type='search')

			.asignadorComuna(v-if="tipoAsignacion === 'comunal'")
				p.descripcionAsignacion El coordinador podrá gestionar a otros apoderados dentro de la comuna.
				+selectorComuna

			.asignadorRegion(v-if="tipoAsignacion === 'regional'")
				p.descripcionAsignacion El apoderado podrá gestionar a otros coordinadores y apoderados dentro de la región.
				a-form-model-item(has-feedback prop="region" label="Región")
					a-select.input(v-model="asignacionTerritorialForm.regionID" @change="elegirRegion" placeholder="Región")
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
				regionID: undefined,
				comunaID: undefined,
				localID: undefined,
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
					comunaID: [{ required: true, message: '*', whitespace: true, trigger: 'blur' }],
				}
			}
			return {
				regionID: [{ required: true, message: '*', whitespace: true, trigger: 'blur' }],
				comunaID: [{ required: true, message: '*', whitespace: true, trigger: 'blur' }],
				localID: [{ required: true, message: '*', whitespace: false, trigger: 'blur' }],
			}
		},
		regionesAsignables () {
			const _ = this._
			if (this.$apoderade.tieneAccesoNacional) return _.map(this.$chile.todasLasRegionesYsusComunas(), r => r.regionID)
			return _.uniq(_.map(_.filter(this.$apoderade.asignaciones, a => a.regionID && a.capa === 'regional'), aa => aa.regionID))
		},
		comunasAsignables () {
			const _ = this._
			if (this.$apoderade.tieneAccesoNacional) return _.map(this.$chile.todasLasComunas(), r => r.comunaID)
			return _.uniq(_.map(_.filter(this.$apoderade.asignaciones, a => a.comunaID && a.capa === 'comunal'), aa => aa.comunaID))
		},
		localesAsignables () {
			const _ = this._
			if (this.$apoderade.tieneAccesoNacional) return _.map(this.$store.state.locales, r => r.localID)
			return _.uniq(_.map(_.filter(this.$apoderade.asignaciones, a => a.localID && a.capa === 'general'), aa => aa.localID))
		},
	},
	mounted () {
		this.filtrarSugerenciasComunas()
		this.filtrarSugerenciasLocales()
	},
	methods: {
		filtrarSugerenciasComunas (buscado) {
			console.log('filtrarSugerenciasComunas', buscado)
			this.busquedaComuna = buscado

			const _ = this._
			const q = parameterize(buscado)
			console.log('query:', q)
			const regiones = Object.values(this.$chile.todasLasRegionesYsusComunas())

			const asignables = this.$apoderade.tieneAccesoNacional? regiones : _.filter(regiones, r => {
				const porCorRegional = this.regionesAsignables.includes(r.regionID) 
				const porCorComunal = this.comunasAsignables.includes(r.comunaID)
				return porCorRegional || porCorComunal
			})

			this.comunasSugeridasPorBusqueda = _.reduce(asignables, (resultado, region) => {
				const comunasCalzantes = _.pickBy(region.comunas, comuna => {
					if (q) return parameterize(comuna.nombre).includes(q)
					return true
				})
				if (_.isEmpty(comunasCalzantes)) return resultado
				resultado.push(Object.assign(region, {comunas: comunasCalzantes}))
				return resultado
			}, [])
		},

		filtrarSugerenciasLocales (buscado) {
			console.log('filtrarSugerenciasLocales', buscado)
			this.busquedaLocal = buscado
			const _ = this._
			const q = buscado && parameterize(buscado)

			const comunaElegida = this.asignacionTerritorialForm.comunaID
			if (!comunaElegida) {
				this.localesSugeridosPorBusqueda = []
				return
			} 

			const locales = Object.values(this.$store.state.locales)
			const asignables = this.$apoderade.tieneAccesoNacional? locales : _.filter(locales, r => {
				const porCorRegional = this.regionesAsignables.includes(r.regionID) 
				const porCorComunal = this.comunasAsignables.includes(r.comunaID)
				const porApoGeneral = this.localesAsignables.includes(r.localID)
				return porCorRegional || porCorComunal || porApoGeneral
			})

			this.localesSugeridosPorBusqueda = _.reduce(asignables, (resultado, local) => {
				if (comunaElegida !== local.comunaID) return resultado
				if (_.isEmpty(q) || parameterize(local.nombre).includes(q)) resultado.push(local)
				return resultado
			}, [])
		},
		elegirRegion (regionID) {
			console.log('elegirRegion', regionID)
			this.asignacionTerritorialForm.regionID = regionID
		},
		async elegirComuna (comunaID) {
			console.log('elegirComuna', comunaID)
			this.asignacionTerritorialForm.comunaID = comunaID
			const regionID = this.$chile.regionIDporComunaID(comunaID)
			if (this.asignacionTerritorialForm.regionID !== regionID) this.asignacionTerritorialForm.regionID = regionID
			this.asignacionTerritorialForm.localID = null
			await new Promise(resolve => this.$nextTick(() => resolve()))
			this.$refs.asignacionTerritorialForm.validate()
			this.filtrarSugerenciasLocales()
			this.buscarLocales(regionID, comunaID)
		},
		elegirLocal (localID) {
			console.log('elegirLocal', localID)
			this.asignacionTerritorialForm.localID = localID
			const comunaID = this._.get(this.$store.state.locales, [localID, 'comunaID'])
			console.log('elegirLocal comunaID =', comunaID)
			if (this.asignacionTerritorialForm.comunaID !== comunaID) this.elegirComuna(comunaID)
			this.$refs.asignacionTerritorialForm.validate()
		},
		asignarTerritorio () {
			const tipoAsignacion = this.tipoAsignacion
			this.$refs.asignacionTerritorialForm.validate(async valid => {
				if (!valid) {
					console.error('Formulario no pasó validación')
					return
				}
				const { regionID, comunaID, localID } = this.asignacionTerritorialForm
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
			this.$nextTick(() => { this.filtrarSugerenciasLocales(this.busquedaLocal) })
			setTimeout(() => { this.filtrarSugerenciasLocales(this.busquedaLocal) }, 500)
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
