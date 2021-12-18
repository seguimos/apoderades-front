<template lang="pug">
.asignadorTerritorio.anchoMovil
	.cabecera
		b Antes de continuar, por favor, indica
		h1 Tu local de votación 

	.modosAsignacion

	.asignadores
		a-form-model.asignadores(ref="localVotacion" :model="localVotacion" :rules="reglasFormAsignacionTerritorial")

			mixin selectorComuna
				a-form-model-item(has-feedback prop="comunaID" label="Comuna")

					a-auto-complete.certain-category-search(dropdown-class-name='certain-category-search-dropdown' :dropdown-match-select-width='false' :dropdown-style="{ width: '300px' }" size='large' style='width: 100%' placeholder='Escribe parte del nombre de la comuna' @focus="filtrarSugerenciasComunas(busquedaComuna)" @search="filtrarSugerenciasComunas" @select="elegirComuna" allow-clear)
						template(slot='dataSource')
							a-select-opt-group(v-for='region in comunasSugeridasPorBusqueda' :key='`reg-${region.regionID}`')
								span(slot='label')
									| {{ region.nombre }}
								a-select-option(v-if="!_.isEmpty(region.comunas)" v-for='comuna in region.comunas' :key='`comuna-${comuna.comunaID}`' :value='comuna.comunaID')
									| {{ comuna.nombre }}
						a-input(ref="comuna")
							//a-icon.certain-category-icon(slot='suffix' type='search')

			.asignadorLocal
				+selectorComuna
				a-form-model-item(has-feedback prop="localID" label="Local de votación")
					a-auto-complete.certain-category-search(dropdown-class-name='certain-category-search-dropdown' :dropdown-match-select-width='false' :dropdown-style="{ width: '300px' }" size='large' style='width: 100%' placeholder='Escribe parte del nombre del local' @focus="filtrarSugerenciasLocales(busquedaLocal)" @search="filtrarSugerenciasLocales" @select="elegirLocal" allow-clear)
						template(slot='dataSource')
							a-select-option(v-if="!_.isEmpty(localesSugeridosPorBusqueda)" v-for='local in localesSugeridosPorBusqueda' :key='`local-${local.localID}`' :value='local.localID')
								| {{ local.nombre }}
								//- span.certain-search-item-count {{ comuna.count }} people
						a-input(ref="local")
							//a-icon.certain-category-icon(slot='suffix' type='search')


				a-form-model-item(has-feedback prop="localID" label="Local de votación")
					a-input(ref="mesa" v-model="localVotacion.mesa")

				a-form-model-item.acciones
					a-button.w100.casiBpStyle.verde(type="primary" @click="guardarLocalDeVotacion") Guardar
				a-button.w100.casiBpStyle(type="dashed" @click='$cuentaBack.preferenciaSaltada = true') Saltar

</template>
<script>
import parameterize from '@lib/parameterize'
export default {
	data () {
		return {
			// Asignacion territorial
			localVotacion: {
				regionID: undefined,
				comunaID: undefined,
				localID: undefined,
				mesa: undefined
			},
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
				mesa: [{ required: false, message: '*', whitespace: false, trigger: 'change' }],
			}
		}
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
			if (_.isEmpty(q)) {
				this.comunasSugeridasPorBusqueda = regiones
				return
			}

			// const filtradas = _.reduce(filtrables, (resultado, region, regionID) => {
			this.comunasSugeridasPorBusqueda = _.reduce(regiones, (resultado, region, regionID) => {
				const comunasCalzantes = _.pickBy(region.comunas, comuna => parameterize(comuna.nombre).includes(q))

				if (_.isEmpty(comunasCalzantes)) return resultado

				resultado.push(_.assignIn({regionID, nombre: region.nombre}, {comunas: comunasCalzantes}))
				return resultado
			}, [])
		},
		filtrarSugerenciasLocales (buscado) {
			console.log('filtrarSugerenciasLocales', buscado)
			this.busquedaLocal = buscado
			const _ = this._
			const q = buscado && parameterize(buscado)
			const comunaElegida = this.localVotacion.comunaID
			if (!comunaElegida) {
				this.localesSugeridosPorBusqueda = []
				return
			} 
			const todosLosLocales = this.$store.state.locales
			this.localesSugeridosPorBusqueda = _.reduce(todosLosLocales, (resultado, local, localID) => {
				if (comunaElegida !== local.comunaID) return resultado
				if (_.isEmpty(q) || parameterize(local.nombre).includes(q)) resultado.push({...local, localID})
				return resultado
			}, [])
		},
		async elegirComuna (comunaID) {
			console.log('elegirComuna', comunaID)
			this.localVotacion.comunaID = comunaID
			const regionID = this.$chile.regionIDporComunaID(comunaID)
			if (this.localVotacion.regionID !== regionID) this.localVotacion.regionID = regionID
			this.localVotacion.localID = null
			await new Promise(resolve => this.$nextTick(() => resolve()))
			this.$refs.localVotacion.validate()
			this.filtrarSugerenciasLocales()
			this.buscarLocales(regionID, comunaID)
		},
		elegirLocal (localID) {
			console.log('elegirLocal', localID)
			this.localVotacion.localID = localID
			const comunaID = this._.get(this.$store.state.locales, [localID, 'comunaID'])
			console.log('elegirLocal comunaID =', comunaID)
			if (this.localVotacion.comunaID !== comunaID) this.elegirComuna(comunaID)
			this.$refs.localVotacion.validate()
		},
		guardarLocalDeVotacion () {
			this.$refs.localVotacion.validate(async valid => {
				if (!valid) {
					console.error('Formulario no pasó validación')
					return
				}
				const { regionID, comunaID, localID, mesa } = this.localVotacion
				const resultado = await this.$cuentaBack.guardarLocalDeVotacion({ regionID, comunaID, localID, mesa })
				console.log('guardarLocalDeVotacion', resultado)
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
.cabecera
	padding-top: 4em
	h1
		margin: 0 0 1rem	
.modosAsignacion
	margin-bottom: 3em
.descripcionAsignacion
	line-height: 1.4
</style>
