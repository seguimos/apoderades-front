<template lang="pug">
.rootParticipa
	.titulo Apoderades por local
	.resumenterritorial
		fieldset
			legend Seleccionar vista
			a-radio-group(v-model='vista' @change='onChange')
				a-radio-button(value='mapa')
					| Mapa
				a-radio-button(value='lista')
					| Lista
		mapa(
			:marcadores="marcadores_locales"
		)


</template>
<script>
import mapa from '../../../components/mapa.vue'
import locales from '../../../data/localesxcomunaexample.js'

export default {
	components: {
		mapa,
		locales
	},
	data () {
		return {
			vista: 'mapa'
			// marcadores: [{ id: 'a', imagen: false, latlon: [-33.429413, -70.627576] }, { id: 'b', imagen: false, latlon: [-33.425555, -70.620127] }]
		}
	},
	computed: {
		marcadores_locales () {
			return locales.locales.regiones.map(x => (
				{ latlon: [x.ubicacion.latitud, x.ubicacion.longitud], id: x._id, nombre: x.nombre, mesas: Object.keys(x.mesas).length }))
		}
	},
	methods: {
		submitForm (formName) {
			// console.log(this.formulario)
			this.$refs[formName].validate(valid => {
				if (valid) {
					this.suscribirse()
					// this.$gtm.push({ event: 'Registro_mailing', nombre: 'Registro en Mailchimp', estado: 'completo' })
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},
		showModal () {
			this.tyc = true
			// this.$gtm.push({ event: 'gtm.linkClick', hacia: 'terminos y condiciones' })
		},
		handleOk (e) {
			console.log(e)
			this.visible = false
			this.tyc = false
			this.procesado = false
		},
		onChange (e) {
			console.log(`checked = ${e.target.value}`)
		}
	}
}
</script>
<style scoped>

</style>

