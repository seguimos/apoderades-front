<template lang="pug">
.appApoderadesIndex

	.miniNavbar
		.cambioEtapa(@click="pasarAEtapa('busquedaRut')") Buscar
		.cambioEtapa(@click="pasarAEtapa('datosPersonales')") Inscribir
		.cambioEtapa(@click="pasarAEtapa('asignacionTerritorial')") Asignar territorio

	.etapas

		.rutForm(v-if="etapa === 'busquedaRut'")
			a-form-model(ref="rutForm" :model="rutForm" :rules="rules")
				a-form-model-item( has-feedback prop="rut" label="Ingresa RUT del apoderado" )
					a-input.input(v-model="rutForm.rut" type="rut" allow-clear)
				a-form-model-item
					a-button.w100.bpStyle.verde(type="primary" @click="submitForm") BUSCAR

		.datosPersonalesForm(v-if="rutInscrito && etapa === 'datosPersonales'")
			a-form-model(ref="personalesForm" :model="personalesForm" :rules="rules")
				a-form-model-item(has-feedback, prop="nombre" label="Nombres")
					a-input.input( v-model="personalesForm.nombre" type="nombre" placeholder="Gabriel" )

				a-form-model-item(has-feedback, prop="apellido" label="Apellidos")
					a-input.input( v-model="personalesForm.apellido" type="apellido" placeholder="Boric Font" )

				a-form-model-item(has-feedback, prop="email" label="Correo")
					a-input.input( v-model="personalesForm.email" type="email" placeholder="gabriel@lesapoderades.cl" )

				a-form-model-item(has-feedback, prop="telefono" label="Teléfono")
					a-input.input( v-model="personalesForm.telefono" type="tel" placeholder="+56 x xxxx xxxx" )

				a-form-model-item
					a-button.w100.bpStyle.verde(type="primary" @click="submitForm") BUSCAR

		.asignacionTerritorial(v-if="usuarioID && etapa === 'asignacionTerritorial'")
			a-form-model-item( v-if="asignacionTerritorialForm.rol" has-feedback, prop="region" label="Región" )
				a-select.input( v-model="asignacionTerritorialForm.region" @change="handleRegion" placeholder="Región" )
					a-select-option( v-for="region in regiones" :key="region.label" :value="region.reg" ) {{ region.label }}

			a-form-model-item( v-if="regionseleccionada" has-feedback, prop="comuna" label="Comuna" )
				a-select.input( v-model="asignacionTerritorialForm.comuna" placeholder="Comuna" @change="handleComuna" @select="buscarLocales" )
					a-select-option( v-for="comuna in comunas" :key="comuna.label" :value="comuna.codigo" ) {{ comuna.label }}

			a-form-model-item(v-if="locales" has-feedback, prop="local" label="Local")
				a-select.input( show-search="" v-model="asignacionTerritorialForm.local" type="local" placeholder="Local de Votación" @change="handleLocal" )
					a-select-option( v-for="local in locales" :key="local._id" :value="local.nombre" ) {{ local.nombre }}
</template>
<script>
import * as Rut from "rut.js";

const rutValidador = (rule, value, callback) => {
	if (!value) return callback(new Error("Ingresa tu rut"));
	if (value.length < 8) return callback(new Error("Ingresa un rut valido"));
	const validado = Rut.validate(Rut.format(Rut.clean(value)));
	if (!validado) return callback(new Error("Ingresa un rut valido"));
	return callback();
};
export default {
	data() {
		return {
			etapa: undefined,
			// Rut
			rutForm: { rut: undefined },
			rules: { rut: [{ validator: rutValidador, trigger: "change" }] },
			rutInscrito: undefined,
			// ID de Apoderade inscrito
			usuarioID: undefined,
			// asignacionTerritorialForm de datos personales
			rutInscritoDatos: undefined,
			personalesForm: {},
			asignacionTerritorialForm: {},
		};
	},
	methods: {
		reset() {
			this.rutForm.resetFields();
		},
		checkRut() {
			this.$refs.rutForm.validate(async valid => {
				if (!valid) return false;
				const r = await this.$cuentaBack.buscarXRut(
					Rut.format(this.rutForm.rut)
				);
				if (r.usuarioID) {
					// TODO Mostrar info usuario
				} else {
					// Preparar para inscribir si
				}
				console.log("submitForm r", r);
			});
		},
	},
};
</script>
<style lang="sass" scoped>
.appApoderadesIndex
	// display: flex
	// flex-flow: column nowrap
	// min-height: 80vh
	.tarjeta
		// flex: 5em 1 1
		display: block
</style>
