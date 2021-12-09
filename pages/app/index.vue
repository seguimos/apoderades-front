<template lang="pug">
.root
	h1 Proto
	.errores(v-if="errorDatos")
		.texto {{ errorDatos }}
</template>
<script>
import axios from 'axios'
export default {
	data () {
		return {
			errorDatos: null
		}
	},
	mounted () {
		this.buscarMisDatos()
		console.log(this.$usuario)
	},
	methods: {
		async buscarMisDatos () {
			const headers = {
				authorization: `Bearer ${this.$cuenta.token}`
			}
			const apoderade = await axios({
				method: 'get',
				url: 'http://localhost:3001/apoderade',
				headers
			})
			console.log('apoderade', apoderade)
			if (!apoderade || !apoderade.data.ok) {
				this.erroDatos = apoderade.data.error
			} else {
				console.log(
					'apoderade.data.usuario.FechaValidacionDatos',
					apoderade.data.usuario[0].FechaValidacionDatos
				)
				if (!apoderade.data.usuario[0].FechaValidacionDatos) {
					this.$store.commit('usuarioNoValidado', apoderade.data.usuario[0])
					this.$router.push('/app/apoderades/validar')
				} else {
					this.$store.commit('usuarioLogeado', apoderade.data.usuario[0])
					this.$router.push('/app/locales/resumenterritorial')
				}
			}
		}
	}
}
</script>
<style lang="sass" scoped></style>
