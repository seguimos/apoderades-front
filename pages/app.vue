<template lang="pug">
.carpetaApp
	.noconectado(v-if="!$usuario")
		div
			cuenta

	// Conectado, pero no se obtuvo datos del back
	.conectadoPeroSinBack(v-else-if="$apoderade === false")
		.tac
			b Error
			p No se pudo conectar con el back

	// No se pudo contarcar con back
	.cargando(v-else-if="$apoderade === false")
		.tac
			a-alert(type="error" message="No se pudo conectar con back")

	// Conectado, obteniendo datos del back
	.cargando(v-else-if="!$apoderade")
		.tac
			a-icon(type="loading")
			p Conectando back

	// Confirmacion de datos personales
	.pasoPrevio(v-else-if="$usuario.sinPass")
		EligePass

	// Confirmacion de datos personales
	.pasoPrevio(v-else-if="!$usuario.datosAutovalidados")
		ValidaTusDatos
		
	// Confirmacion de preferencia de local
	.pasoPrevio(v-else-if="!_.get($cuentaBack, ['apoderade', 'fechaValidacionDatos']) && !$cuentaBack.preferenciaSaltada")
		TerritorioPreferencia

	.conectado(v-else)
		.contenido
			n-child
		.pieUsuario
</template>
<script>
import EligePass from './app/-eligePass.vue'
import ValidaTusDatos from './app/-validaTusDatos.vue'
import TerritorioPreferencia from './app/-territorioPreferencia.vue'
export default {
	components: { ValidaTusDatos, TerritorioPreferencia, EligePass }
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

.conectado
	width: 900px
	max-width: 100%
	margin: 0 auto
	.contenido
		flex: auto 1 1
		padding: 2em
	
</style>
