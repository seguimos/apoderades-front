<template lang="pug">
.paginaIngresoConToken
	.error(v-if="error")
		//- a-icon.icono.alverre(type="smile")
		.icono 🙃
		h3 {{ error.titulo }}
		p {{ error.descripcion }}

		p.info Si tienes problemas para ingresar, puedes cambiar tu contraseña en el formulario de ingreso a tu cuenta.

		.acciones
			a-button.casiBpStyle.verde(@click="$router.replace('/app')") Ir al ingreso
	.cargando(v-else-if="ingresandoConToken")
		a-icon(type="loading")
</template>
<script>
export default {
	data () {
		return {
			error: null,
			tokenInvalido: null,
			ingresandoConToken: null
		}
	},
	computed: {
		token () {
			return this.$route.query.token
		}
	},
	mounted () {
		// Verificar si está ingresando
		if (this.$cuenta.inicializado) this.detectarToken()
		this.$cuenta.on('initListo', () => {
			this.detectarToken()
		})
	},
	methods: {
		async detectarToken () {
			if (!this.token) return
			if (!this.token) this.$router.replace('/')
			await new Promise(resolve => { this.$nextTick(() => { resolve() }) })
			this.ingresarConToken()
		},
		async ingresarConToken () {
			if (!this.token) return
			this.ingresandoConToken = true
			console.log('ingresando con token')
			await this.$cuenta.salir()
			await new Promise(resolve => { this.$nextTick(() => { resolve() }) })
			const ingresoConToken = await this.$cuenta.ingresarConToken(this.token)
			if (!ingresoConToken.ok) {
				this.error = {
					titulo: 'No se pudo ingresar.',
					descripcion: 'El token es inválido o ya ha sido utilizado.'
				}
				return
			}
			this.$router.replace('/app')
		}
	}
}
</script>
<style lang="sass" scoped>
@import "@style/vars"

.paginaIngresoConToken
	height: 100%
	display: flex
	flex-flow: column nowrap
	justify-content: center
	align-items: center
	text-align: center
	> div
		width: 400px
		max-width: 100%
		margin: 0 auto
	.error
		.icono
			font-size: 6em
		.info
			opacity: .7
			margin: 2em 0

</style>
