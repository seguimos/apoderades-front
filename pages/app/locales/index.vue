<template lang="pug">
.rootParticipa
	h1 Resumen Territorial
	.resumenterritorial(v-if="territorioActual")
		a(@click="subirUnNivel()")
			resumenTerritorial(:titulo="territorioActual.nombre", :resumen="territorioActual.estadisticas", @click="console.log('hola!')")
		mapa(:marcadores="marcadores_locales", v-if="mapa")
		div(v-else)
			a(
				v-for="hijo in territorioActual.hijos",
				@click="irATerritorio(hijo.tipo, hijo.id)",
				:key="hijo.id",
			)
				resumenTerritorial(
					:titulo="hijo.nombre",
					:resumen="hijo.estadisticas"
				)
		a-button.ver-mapa(type="primary", block, @click="mapa = !mapa")
			span(v-if="!mapa") Ver Mapa
			span(v-else) Ver Lista

	.cargando(v-else)
		| Cargando...
</template>
<script>
import mapa from '../../../components/mapa'
import resumenTerritorial from '../../../components/locales/resumenTerritorial.vue'

export default {
	components: {
		mapa,
		resumenTerritorial
	},
	data () {
		return {
			territorios: null,
			mapa: this.$route.query.mapa,
			region: this.$route.query.region,			// marcadores: [{ id: 'a', imagen: false, latlon: [-33.429413, -70.627576] }, { id: 'b', imagen: false, latlon: [-33.425555, -70.620127] }]
			comuna: this.$route.query.comuna,			// marcadores: [{ id: 'a', imagen: false, latlon: [-33.429413, -70.627576] }, { id: 'b', imagen: false, latlon: [-33.425555, -70.620127] }]
			local: this.$route.query.local			// marcadores: [{ id: 'a', imagen: false, latlon: [-33.429413, -70.627576] }, { id: 'b', imagen: false, latlon: [-33.425555, -70.620127] }]
		}
	},

	computed: {
		marcadores_locales () {
			const locales = []
			this.territorios.hijos.forEach(region => {
				region.hijos.forEach(comuna => {
					comuna.hijos.forEach(local => {
						locales.push({
							latlon: [local.ubicacion.latitud, local.ubicacion.longitud],
							id: local.id,
							nombre: local.nombre,
							mesas: local.estadisticas.numeroMesas
						})
					})
				})
			})
			return locales
		},
		territorioActual () {
			let territorioActual = this.territorios
			if (territorioActual && this.region) {
				console.log(territorioActual)
				territorioActual = territorioActual.hijos.find(hijo => {
					return hijo.id === this.region
				})
				if (territorioActual && this.comuna) {
					territorioActual = territorioActual.hijos.find(hijo => {
						return hijo.id === this.comuna
					})
					if (territorioActual && this.local) {
						territorioActual = territorioActual.hijos.find(hijo => {
							return hijo.id === this.local
						})
					}
				}
			}
			return territorioActual
		}
	},
	mounted () {
		this.buscarResumenComuna()
	},
	methods: {
		async buscarResumenComuna () {
			const resp = await this.$back.misTerritorios()
			if (resp.ok === 1) {
				this.territorios = {
					nombre: 'Resumen Nacional',
					tipo: 'nacional',
					id: '',
					estadisticas: resp.territorios.estadisticas,
					hijos: resp.territorios.regiones.map(region => {
						return {
							nombre: region.nombre.replace('_', ' '),
							tipo: 'region',
							id: region.nombre,
							estadisticas: region.estadisticas,
							hijos: region.comunas.map(comuna => {
								return {
									nombre: comuna.comuna,
									tipo: 'comuna',
									id: comuna.comunaCodigo,
									estadisticas: comuna.estadisticas,
									hijos: comuna.locales.map(local => {
										return {
											nombre: local.nombre,
											tipo: 'local',
											id: local._id,
											ubicacion: local.ubicacion,
											estadisticas: local.estadisticas,
											hijos: []
										}
									})
								}
							})
						}
					})
				}
			}
		},
		irATerritorio (tipo, territorio) {
			this[tipo] = territorio
			const currentRoute = { ...this.$route.query }
			currentRoute[tipo] = territorio
			this.$router.push({ path: this.$route.path, query: currentRoute })
		},
		subirUnNivel () {
			const currentRoute = this.$route.query
			if (this.local) {
				this.local = undefined
				this.$router.push({ path: this.$route.path, query: { region: currentRoute.region, comuna: currentRoute.comuna } })
			} else if (this.comuna) {
				this.local = undefined
				this.comuna = undefined
				this.$router.push({ path: this.$route.path, query: { region: currentRoute.region } })
			} else {
				this.local = undefined
				this.comuna = undefined
				this.region = undefined
				this.$router.push({ path: this.$route.path, query: { } })
			}
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

