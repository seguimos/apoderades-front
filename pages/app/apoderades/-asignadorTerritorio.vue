<template lang="pug">
.asignadorTerritorio
	a-form-model(ref="asignacionTerritorialForm" :model="asignacionTerritorialForm" :rules="reglasFormAsignacionTerritorial")

		//a-form-model-item(has-feedback prop="region" label="Región")
			a-select.input(v-model="asignacionTerritorialForm.region" @change="elegirRegion" placeholder="Región")
				a-select-option(v-for="(region, regionID) in regionesAsignables" :key="`region-${regionID}`" :value="regionID") {{ region.nombre }}

		a-auto-complete.certain-category-search(dropdown-class-name='certain-category-search-dropdown' :dropdown-match-select-width='false' :dropdown-style="{ width: '300px' }" size='large' style='width: 100%' placeholder='input here' option-label-prop='value')
			template(slot='dataSource')
				a-select-opt-group(v-for='group in dataSource' :key='group.title')
					span(slot='label')
						| {{ group.title }}
						a(style='float: right' href='https://www.google.com/search?q=antd' target='_blank' rel='noopener noreferrer') more
					a-select-option(v-for='opt in group.children' :key='opt.title' :value='opt.title')
						| {{ opt.title }}
						span.certain-search-item-count {{ opt.count }} people
				a-select-option.show-all(key='all' disabled='')
					a(href='https://www.google.com/search?q=ant-design-vue' target='_blank' rel='noopener noreferrer') View all results
			a-input
				a-icon.certain-category-icon(slot='suffix' type='search')
				
		a-form-model-item
			div {{comunasAsignables}}

		a-form-model-item(has-feedback prop="comuna" label="Comuna")
			a-select.input(v-model="asignacionTerritorialForm.comuna" placeholder="Comuna" @change="elegirComuna")
				a-select-option(v-for="(comuna, comunaID) in comunasAsignables" :key="`comuna-${comunaID}`" :value="comunaID") {{ comuna.nombre }}

		a-form-model-item(has-feedback prop="local" label="Local")
			a-select.input(show-search="" v-model="asignacionTerritorialForm.local" type="local" placeholder="Local de Votación" @change="elegirLocal")
				a-select-option(v-for="(local, localID) in localesAsignables" :key="localID" :value="local.nombre") {{ local.nombre }}

		a-form-model-item
			div {{localesAsignables}}


		a-form-model-item
			a-button.w100.bpStyle.verde(type="primary" @click="asignarTerritorio") Asignar territorio
</template>
<script>
import { regionesYSusComunas, comunasEnUnaRegion, regionIDDeComuna } from '@lib/regioneschile'
export default {
	props: {
		usuarioID: {
			type: String,
			required: true
		}
	},
	data () {
		return {
			// Asignacion territorial
			asignacionTerritorialForm: {
				region: undefined,
				comuna: undefined,
				local: undefined,
			},
			localesPorComuna: {}
		}
	},
	computed: {

		reglasFormAsignacionTerritorial () {
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
		}
	},
	methods: {
		// Asignación de territorio
		elegirRegion (regionID) {
			console.log('elegirRegion', regionID)
		},
		elegirComuna (comunaID) {
			console.log('elegirComuna', comunaID)
			const regionID = regionIDDeComuna(comunaID)
			if (this.asignacionTerritorialForm.region !== regionID) this.asignacionTerritorialForm.region = regionID
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
<style lang="sass" scoped></style>
