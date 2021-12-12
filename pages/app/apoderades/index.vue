<template lang="pug">
.appApoderadesIndex

	.miniNavbar
		.cambioEtapa(:class="{activa: !etapa}" @click="pasarAEtapa()") Buscar
		//- .cambioEtapa(:class="{activa: etapa === 'datosPersonales'}" @click="pasarAEtapa('datosPersonales')") Inscribir
		.cambioEtapa(:class="{activa: etapa === 'asignacionTerritorial'}" @click="pasarAEtapa('asignacionTerritorial')") Asignar territorio

	.apoderadeEncontrade
		b.nombre {{}}


	.etapas

		.rutForm(v-if="!etapa")
			checkPorRut(ref="checkPorRut" @quiereIncribir="iniciarInscripcion" @quiereAsignar="iniciarAsignacion" @encontrade="")

		.datosPersonalesForm(v-if="rut && etapa === 'datosPersonales'")
			creadorApoderade(ref="creadorApoderade" @buscarRut="pasarAEtapa()" :rut="rut" @quiereAsignar="iniciarAsignacion")

		.asignacionTerritorial(v-if="usuarioID && etapa === 'asignacionTerritorial'")
			asignadorTerritorio(ref="asignadorTerritorio" :usuarioID="usuarioID")
						
</template>
<script>
import checkPorRut from './-checkPorRut'
import creadorApoderade from './-creadorApoderade'
import asignadorTerritorio from './-asignadorTerritorio'

export default {
	components: { checkPorRut, creadorApoderade, asignadorTerritorio },
	data() {
		return {
			etapa: 'asignacionTerritorial',
			rut: undefined,
			usuarioID: 'mCFZrWduMw'
		}
	},
	computed: {
		puedeIngresarDatos () {
			return this.rutForm.rut && !this.usuarioID
		},
	},
	methods: {
		pasarAEtapa (etapa) { this.etapa = etapa },
		iniciarInscripcion (rut) {
			this.rut = rut
			const vm = this
			this.$nextTick(() => { vm.pasarAEtapa('datosPersonales') })
		},
		iniciarAsignacion (usuarioID) {
			this.usuarioID = usuarioID
			const vm = this
			this.$nextTick(() => { vm.pasarAEtapa('asignacionTerritorial') })
		}
	},
};
</script>
<style lang="sass" scoped>
@import '@style/utils'
.appApoderadesIndex
	margin: 0 auto
	max-width: 100%
	width: 400px
	// display: flex
	// flex-flow: column nowrap
	// min-height: 80vh
	.tarjeta
		// flex: 5em 1 1
		display: block


.miniNavbar
	display: flex
	margin-bottom: 3em
	.cambioEtapa
		display: block
		+ .cambioEtapa
			margin-left: 1em
		&.activa
			+bold
</style>
