<template lang="pug">
.carpetaApp
	transition-group.transicionesDentro
		.noconectado(v-if="!$usuario" key="noconectado")
			div
				cuenta

		// Conectado, pero no se obtuvo datos del back
		.conectadoPeroSinBack(key="conectadoPeroSinBack" v-else-if="$apoderade === false")
			.tac
				b Error
				p No se pudo conectar con el back

		// Conectado, obteniendo datos del back
		.cargando(key="errorBack" v-else-if="$cuentaBack.sinConexion")
			.tac
				.icono 🥲
				p Backend sin conexion
		.cargando(key="cargandoBack" v-else-if="!$apoderade")
			.tac
				.icono 🌱
				a-icon(type="loading")
				p Conectando back

		// Confirmacion de datos personales
		.pasoPrevio(key="eligePass" v-else-if="$usuario.sinPass")
			EligePass

		// Confirmacion de datos personales
		.pasoPrevio(key="validate" v-else-if="!$usuario.datosAutovalidados")
			ValidaTusDatos
			
		// Confirmacion de preferencia de local
		.pasoPrevio(key="localVotacion" v-else-if="!_.get($cuentaBack, ['apoderade', 'fechaValidacionDatos']) && !$cuentaBack.preferenciaSaltada")
			LocalVotacion

		.conectado(key="app" v-else)
			.contenido
				n-child
			.pieUsuario
</template>
<script>
import EligePass from './app/-eligePass.vue'
import ValidaTusDatos from './app/-validaTusDatos.vue'
import LocalVotacion from './app/-localVotacion.vue'
export default {
	components: { ValidaTusDatos, LocalVotacion, EligePass }
	// layout: 'app'
}
</script>
<style lang="sass" scoped>
@import "@style/vars"

// .carpetaApp
.noconectado,
.conectadoPeroSinBack,
.cargando
	min-height: 80vh
	display: flex
	justify-content: center
	align-items: center
	text-align: center
	.ant-btn
		margin-top: 2em
		
.pasoPrevio
	padding: 2em
	width: 400px
	max-width: 100%
	margin: 0 auto

.icono
	font-size: 4em
.conectado
	// .contenido
	&::v-deep
		.anchoComun
			width: 600px
			max-width: 100%
			margin: 0 auto
			flex: auto 1 1
			padding: 2em

		.wrapperEncabezado
			background-color: #f5f5f5
			//.anchoComun

.transicionesDentro
	> div
		// +saliendo
			// max-height: 100vh
			// overflow: hidden
		+salir
			// max-height: 0
			opacity: 0
</style>
