<template lang="pug">
.rootParticipa
	h1 Resumen Territorial
	.resumenterritorial(v-if="territorioActual")
		a(@click="subirUnNivel()")
			locales-resumenTerritorial(:titulo="`Territorio actual: ${territorioActual.nombre}`", :resumen="territorioActual.estadisticas", @click="console.log('hola!')")
		a-button(class="button-red" block size="large" v-if="puedeDesignarCoordinador")
			| Designar Coordinador a esta zona
		h2 Territorios internos
		mapa(:marcadores="marcadoresLocales", v-if="mapa")
		div(v-else)
			a(
				v-for="hijo in territorioActual.hijos",
				@click="irATerritorio(hijo.tipo, hijo.id)",
				:key="hijo.id",
			)
				locales-resumenTerritorial(
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
export default {
	data () {
		return {
			territorios: null,
			mapa: this.$route.query.mapa,
			region: this.$route.query.region,
			comuna: this.$route.query.comuna
		}
	},

	computed: {
		marcadoresLocales () {
			const locales = []
			this.territorios.hijos.forEach(region => { // todo: mostrar solo actuales
				region.hijos.forEach(comuna => {
					comuna.hijos.forEach(local => {
						locales.push(local)
					})
				})
			})
			return locales
		},
		puedeDesignarCoordinador () {
			let response = false
			if(this.region) response = this.$apoderade.tieneAccesoNacional
			if(this.comuna) response = response || this.$apoderade.regionesAdministradas.includes(this.region)
			return response
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
				}
			}
			return territorioActual
		}
	},
	watch: {
		'$route' ($to, $from) {
			this.region = $to.query.region
			this.comuna = $to.query.comuna
		}
	},
	mounted () {
		this.getMisTerritorios().then(() => {
			let curr = this.territorioActual
			while(curr.hijos.length === 1) {
				curr = curr.hijos[0]
				this.irATerritorio(curr.tipo, curr.id)
			}
		})
	},
	methods: {
		async getMisTerritorios () {
			const resp = await this.$cuentaBack.misTerritorios()
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
			if (tipo !== 'local') {
				this[tipo] = territorio
				const currentRoute = { ...this.$route.query }
				currentRoute[tipo] = territorio
				this.$router.push({ path: this.$route.path, query: currentRoute })
			} else {
				console.log(`local ${territorio} y region ${this.region}`)
				this.$router.push({ path: `locales/resumen-local/${this.region}/${territorio}` })
			}
		},
		subirUnNivel () {
			const currentRoute = this.$route.query
			if (this.comuna) {
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

.button-red
	background-color: #FF9999
	color: white
</style>

