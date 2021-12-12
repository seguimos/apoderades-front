<template lang="pug">
.asignadorTerritorio

	//- pre asignacionTerritorialForm
	//- div {{asignacionTerritorialForm}}
	.modosAsignacion
		a-radio-group(v-model="modoAsignacion" button-style="solid")
			a-radio-button(value='region') Gestor Región
			a-radio-button(value='comuna') Gestor Comuna
			a-radio-button(value='local') Asignar local

	.asignadores
		a-form-model.asignadores(ref="asignacionTerritorialForm" :model="asignacionTerritorialForm" :rules="reglasFormAsignacionTerritorial")
			.asignadorLocal(v-if="modoAsignacion === 'local'")

				p.descripcionAsignacion Al asignar a un apoderado a un local de votación, si se marca como apoderado general, podrá validar a los demás apoderados para utilizar la plataforma y cargar información de mesas.
				a-form-model-item(has-feedback prop="comuna" label="Comuna")
					a-auto-complete.certain-category-search(dropdown-class-name='certain-category-search-dropdown' :dropdown-match-select-width='false' :dropdown-style="{ width: '300px' }" size='large' style='width: 100%' placeholder='Escribe parte del nombre de la comuna' @search="filtrarSugerenciasComunas" @select="elegirComuna")
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
							a-icon.certain-category-icon(slot='suffix' type='search')

				a-form-model-item(has-feedback prop="local" label="Local")
					a-select.input(show-search="" v-model="asignacionTerritorialForm.local" type="local" placeholder="Local de Votación" @change="elegirLocal")
						a-select-option(v-for="(local, localID) in localesAsignables" :key="localID" :value="local.nombre") {{ local.nombre }}

				a-form-model-item
					a-button.w100.bpStyle.verde(type="primary" @click="asignarTerritorio") Asignar a local


			.asignadorComuna(v-if="modoAsignacion === 'comuna'")

				p.descripcionAsignacion El apoderado podrá gestionar a otros usuarios dentro de la comuna.

				a-form-model-item(has-feedback prop="comuna" label="Comuna")
					a-auto-complete.certain-category-search(dropdown-class-name='certain-category-search-dropdown' :dropdown-match-select-width='false' :dropdown-style="{ width: '300px' }" size='large' style='width: 100%' placeholder='Escribe parte del nombre de la comuna' @search="filtrarSugerenciasComunas" @select="elegirComuna")
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
							a-icon.certain-category-icon(slot='suffix' type='search')
						
				a-form-model-item
					a-button.w100.bpStyle.verde(type="primary" @click="asignarTerritorio") Dar permiso en toda la comuna


			.asignadorRegion(v-if="modoAsignacion === 'region'")

				p.descripcionAsignacion El apoderado podrá gestionar a otros usuarios dentro de la región.
				a-form-model-item(has-feedback prop="region" label="Región")
					a-select.input(v-model="asignacionTerritorialForm.region" @change="elegirRegion" placeholder="Región")
						a-select-option(v-for="(region, regionID) in regionesAsignables" :key="`region-${regionID}`" :value="regionID") {{ region.nombre }}

				a-form-model-item
					a-button.w100.bpStyle.verde(type="primary" @click="asignarTerritorio") Dar permiso en toda la región
</template>
<script>
import { regionesYSusComunas, comunasEnUnaRegion, regionIDDeComuna } from '@lib/regioneschile'
import parameterize from '@lib/parameterize'
export default {
	props: {
		usuarioID: {
			type: String,
			required: true
		}
	},
	data () {
		return {
			modoAsignacion: 'local',
			// Asignacion territorial
			asignacionTerritorialForm: {
				region: undefined,
				comuna: undefined,
				local: undefined,
			},
			localesPorComuna: {},
			busquedaComuna: ''
		}
	},
	computed: {
		reglasFormAsignacionTerritorial () {
			if (this.modoAsignacion === 'region') {
				return {
					region: [{ required: true, message: '*', whitespace: true }],
				}
			} else if (this.modoAsignacion === 'comuna') {
				return {
					region: [{ required: true, message: '*', whitespace: true }],
					comuna: [{ required: true, message: '*', whitespace: true }],
				}
			}
			return {
				region: [{ required: true, message: '*', whitespace: true }],
				comuna: [{ required: true, message: '*', whitespace: true }],
				local: [{ required: true, message: '*', whitespace: false }],
			}
		},
		asignableNacional () { return this.$apoderade.tieneAccesoNacional },
		regionesYSusComunas () { return regionesYSusComunas },
		regionesAsignables () {
			if (this.$apoderade.tieneAccesoNacional) return regionesYSusComunas
			const regionesAlcanzadas = this.$apoderade.territorios.map(t => t.region)
			return this._.pickBy(regionesYSusComunas, (r, regionID) => regionesAlcanzadas.includes(regionID))
		},
		comunasXRegionAsignables () {
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
				comunasAsignables = comunasEnUnaRegion(idRegionElegida)
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
			if (_.isEmpty(buscado)) return this.comunasXRegionAsignables
			let comunasFiltradas = Object.assign({}, this.comunasXRegionAsignables)
			_.forEach(comunasFiltradas, (region, regionID) => {
				comunasFiltradas[regionID].comunas = _.pickBy(region.comunas, comuna => parameterize(comuna.nombre).includes(buscado))
			})
			comunasFiltradas = _.filter(comunasFiltradas, region => !_.isEmpty(region.comunas))
			return comunasFiltradas
		}
	},
	methods: {
		filtrarSugerenciasComunas (buscado) {
			this.busquedaComuna = buscado
		},
		// Asignación de territorio
		elegirRegion (regionID) {
			console.log('elegirRegion', regionID)
		},
		elegirComuna (comunaID) {
			console.log('elegirComuna', comunaID)
			this.asignacionTerritorialForm.comuna = comunaID
			const regionID = regionIDDeComuna(comunaID)
			if (this.asignacionTerritorialForm.region !== regionID) this.asignacionTerritorialForm.region = regionID
			this.$refs.asignacionTerritorialForm.validate()
			this.buscarLocales(regionID, comunaID)
		},
		elegirLocal (e) {
			console.log('elegirLocal', e)
		},
		asignarTerritorio () {},

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
