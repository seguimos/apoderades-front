<template lang="pug">
.appApoderadesIndex

	.misTerritorios
		pre apoderade
		div {{$apoderade}}
		pre misTerritorios
		div {{$cuentaBack.territorios}}
		//- pre regionesAsignables
		//- div {{regionesAsignables}}
	.miniNavbar
		.cambioEtapa(:class="{activa: !etapa}" @click="pasarAEtapa()") Buscar
		.cambioEtapa(:class="{activa: etapa === 'datosPersonales'}" @click="pasarAEtapa('datosPersonales')") Inscribir
		.cambioEtapa(:class="{activa: etapa === 'asignacionTerritorial'}" @click="pasarAEtapa('asignacionTerritorial')") Asignar territorio

	.etapas

		.rutForm(v-if="!etapa")
			a-form-model(ref="rutForm" :model="rutForm" :rules="reglasFormRut")
				a-form-model-item(has-feedback prop="rut" label="Ingresa RUT del apoderado")
					a-input.input(v-model="rutForm.rut" type="rut" allow-clear)
				a-form-model-item
					a-button.w100.bpStyle.verde(type="primary" @click="checkRut") BUSCAR

		.datosPersonalesForm(v-if="rutNoInscrito && etapa === 'datosPersonales'")
			a-form-model(ref="personalesForm" :model="personalesForm" :rules="reglasFormDatosPersonales")
				a-form-model-item(has-feedback prop="nombre" label="Nombres")
					a-input.input(v-model="personalesForm.nombre" type="nombre" placeholder="Gabriel")

				a-form-model-item(has-feedback prop="apellido" label="Apellidos")
					a-input.input(v-model="personalesForm.apellido" type="apellido" placeholder="Boric Font")

				a-form-model-item(has-feedback prop="email" label="Correo")
					a-input.input(v-model="personalesForm.email" type="email" placeholder="gabriel@lesapoderades.cl")

				a-form-model-item(has-feedback prop="telefono" label="Teléfono")
					a-input.input(v-model="personalesForm.telefono" type="tel" placeholder="+56 x xxxx xxxx")

				a-form-model-item
					a-button.w100.bpStyle.verde(type="primary" @click="guardarDatosPersonales") Guardar datos personales

		.asignacionTerritorial(v-if="usuarioID && etapa === 'asignacionTerritorial'")
			a-form-model(ref="asignacionTerritorialForm" :model="asignacionTerritorialForm" :rules="reglasFormAsignacionTerritorial")

				a-form-model-item(has-feedback prop="region" label="Región")
					a-select.input(v-model="asignacionTerritorialForm.region" @change="elegirRegion" placeholder="Región")
						a-select-option(v-for="(region, regionID) in regionesAsignables" :key="`region-${regionID}`" :value="regionID") {{ region.nombre }}

				a-form-model-item(has-feedback prop="comuna" label="Comuna")
					a-select.input(v-model="asignacionTerritorialForm.comuna" placeholder="Comuna" @change="elegirComuna")
						a-select-option(v-for="(comuna, comunaID) in comunasAsignables" :key="`comuna-${comunaID}`" :value="comunaID") {{ comuna.nombre }}

				a-form-model-item(has-feedback prop="local" label="Local")
					a-select.input(show-search="" v-model="asignacionTerritorialForm.local" type="local" placeholder="Local de Votación" @change="elegirLocal")
						a-select-option(v-for="(local, localID) in localesAsignables" :key="localID" :value="local.nombre") {{ local.nombre }}

				a-form-model-item
					a-button.w100.bpStyle.verde(type="primary" @click="asignarTerritorio") Asignar territorio
						
</template>
<script>
import * as Rut from "rut.js"
import { Validado } from "@lib/validador"
import { regionesYSusComunas, comunasEnUnaRegion, regionIDDeComuna } from '@lib/regioneschile'

export default {
	data() {
		return {
			etapa: 'asignacionTerritorial',
			// Rut
			rutForm: { rut: undefined },
			rutInscrito: undefined,
			usuarioID: 'mhslBh6hHa',
			rutNoInscrito: undefined,
			rutInscritoDatos: undefined,
			// Datos personales
			personalesForm: {
				nombre: undefined,
				apellido: undefined,
				email: undefined,
				telefono: undefined
			},
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
		reglasFormRut () {
			const rutValidador = (rule, value, callback) => {
				if (!value) return callback(new Error("Ingresa tu rut"));
				if (value.length < 8) return callback(new Error("Ingresa un rut valido"));
				const validado = Validado.rut(value)
				if (!validado) return callback(new Error("Ingresa un rut valido"));
				return callback();
			};
			return { 
				rut: [{ required: true, message: '*', whitespace: false }, { validator: rutValidador, trigger: "change" }] 
			}
		},
		reglasFormDatosPersonales () {
			const telefonoValidador = (rule, value, callback) => {
				if (!value) return callback(new Error("Ingresa el telefono"));
				if (value.length < 8) return callback(new Error("Ingresa un telefono valido"));
				const validado = Validado.telefono(value)
				if (!validado) return callback(new Error("Ingresa un rut valido"));
				return callback();
			};
			return {
				nombre: [{ required: true, message: '*', whitespace: true }],
				apellido: [{ required: true, message: '*', whitespace: true }],

				email: [{ type: 'email', message: 'Email inválido' }, { required: true, message: 'Ingresa email' }],
				telefono: [{ required: true, message: '*', whitespace: true }, { validator: telefonoValidador, trigger: "change" }] 
			}
		},
		reglasFormAsignacionTerritorial () {
			return {
				region: [{ required: true, message: '*', whitespace: true }],
				comuna: [{ required: true, message: '*', whitespace: true }],

				local: [{ type: 'email', message: 'Email inválido' }, { required: true, message: 'Ingresa email' }],
			}
		},
		puedeIngresarDatos () {
			return this.rutForm.rut && !this.usuarioID
		},

		// Asignación territorial
		asignableNacional () { return this.$apoderade.tieneAccesoNacional },
		regionesYSusComunas () { return regionesYSusComunas },
		regionesAsignables () {
			if (this.$apoderade.tieneAccesoNacional) return regionesYSusComunas
			const regionesAlcanzadas = this.$apoderade.territorios.map(t => t.region)
			return this._.pickBy(regionesYSusComunas, (r, regionID) => regionesAlcanzadas.includes(regionID))
		},
		comunasAsignables () {
			const _ = this._
			// region?: string;
			// comunaCodigo?: string;
			// llavePublicaAsignador?: string;
			// localId?: string;
			// esApoderadoGeneral?: boolean;
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
		reset() { this.rutForm.resetFields(); },
		pasarAEtapa (etapa) { this.etapa = etapa },
		checkRut() {
			this.$refs.rutForm.validate(async valid => {
				if (!valid) return false;
				const rut = this.rutForm.rut
				const r = await this.$cuentaBack.buscarXRut(Rut.format(rut) );
				if (r.usuarioID) {
					// TODO Mostrar info usuario
					this.usuarioID = r.usuarioID
					this.rutInscrito = rut
				} else {
					// Preparar para inscribir si
					this.rutNoInscrito = rut
				}
				console.log("checkRut r", r);
			});
		},
		guardarDatosPersonales () {},
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
		},
	},
};
</script>
<style lang="sass" scoped>
@import '@style/utils'
.appApoderadesIndex
	// display: flex
	// flex-flow: column nowrap
	// min-height: 80vh
	.tarjeta
		// flex: 5em 1 1
		display: block


.miniNavbar
	display: flex
	margin-bottom: 1em
	.cambioEtapa
		display: block
		+ .cambioEtapa
			margin-left: 1em
		&.activa
			+bold
</style>
