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

	// Conectado, datos del back listos
	//.conectado(v-else)
		.contenido
			n-child
		.pieUsuario

	validaTusDatos(v-else-if="!$usuario.datosAutovalidados")
	territorioPreferencia(v-else-if="!_.get($cuentaBack, ['apoderade', 'fechaValidacionDatos'])")
	.conectado(v-else)
		//.permisos
			div
				b Puedes:
			div Acceso a nivel nacional: {{$apoderade.tieneAccesoNacional ? '✅' : '⛔️'}}
			div Acceso a nivel territorial: {{$apoderade.territoriosAsignados && $apoderade.territoriosAsignados.length ? '✅' : '⛔️'}}
		//b Usuario
		//div {{$usuario}}

		.contenido
			n-child
		.pieUsuario
</template>
<script>
import validaTusDatos from './app/-validaTusDatos.vue'
import territorioPreferencia from './app/-territorioPreferencia.vue'
export default {
	components: { validaTusDatos, territorioPreferencia }
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

.conectado
	width: 900px
	max-width: 100%
	margin: 0 auto
	.contenido
		flex: auto 1 1
		padding: 2em

	
</style>
