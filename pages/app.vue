<template lang="pug">
.carpetaApp
	.noconectado(v-if="!$usuario")
		div
			cuenta

	// Conectado, pero no se obtuvo datos del back
	.conectadoPeroSinBack(v-else-if="$cuentaBack.apoderade === false")
		.tac
			b Error
			p No se pudo conectar con el back

	// Conectado, obteniendo datos del back
	.cargando(v-else-if="!$cuentaBack.apoderade")
		.tac
			a-icon(type="loading")
			p Cargando

	// Conectado, datos del back listos
	.conectado(v-else-if="_.get($cuentaBack, ['apoderade', 'fechaValidacionDatos'])")
		//- navbar
		.contenido
			n-child
	valida-tus-datos(v-else)
</template>
<script>
import navbar from './app/-navbar.vue'
import validaTusDatos from './app/-validaTusDatos.vue'
export default {
	components: { navbar, validaTusDatos }
	// layout: 'app'
}
</script>
<style lang="sass" scoped>
@import "@style/vars"

.carpetaApp
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
