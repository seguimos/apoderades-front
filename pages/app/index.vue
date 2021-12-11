<template lang="pug">
.rootParticipa
	h1 Resumen Territorial
	.resumenterritorial
		resumenLocal(titulo="Resumen Nacional", :resumen="resumen")
		a-button.ver-mapa(type="primary", block, @click="mapa = !mapa")
			span(v-if="!mapa") Ver Mapa
			span(v-else) Ver Lista
		mapa(:marcadores="marcadores_locales", v-if="mapa")
		div(v-else)
			resumenLocal(
				v-for="region in regiones",
				:key="region.reg",
				:titulo="region.nombre",
				:resumen="resumen"
			)
</template>
<script>
import mapa from '../../components/mapa'
import locales from '../../data/localesxcomunaexample'
import resumenLocal from '../../components/locales/resumenLocal.vue'

export default {
	components: {
		mapa,
		locales,
		resumenLocal
	},
	data () {
		return {
			regiones: locales.locales.regiones,
			mapa: false,
			resumen: {
				locales: {
					total: 10,
					apoderades: 50,
					sinApoderades: 10
				},
				mesas: {
					total: 44,
					abiertas: 10,
					noConstituidas: 43
				}
			}
			// marcadores: [{ id: 'a', imagen: false, latlon: [-33.429413, -70.627576] }, { id: 'b', imagen: false, latlon: [-33.425555, -70.620127] }]
		}
	},

	computed: {
		marcadores_locales () {
			return locales.locales.regiones.map(x => ({
				latlon: [x.ubicacion.latitud, x.ubicacion.longitud],
				id: x._id,
				nombre: x.nombre,
				mesas: Object.keys(x.mesas).length
			}))
		}
	},
	mounted () {
		// this.buscarResumenComuna()
	},
	methods: {
		async buscarResumenComuna () {
			const locales = await this.$back.localesXComuna()
			console.log('locales', locales)
		},
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
<style lang="sass" scoped>
@import '@style/paleta'
@import '@style/utils'

.ver-mapa
	margin: 10px 0
	background-color: $verde3
	color: $petroleo1
	font-size: larger
	height: 40px
</style>

