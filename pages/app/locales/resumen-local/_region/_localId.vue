<template lang="pug">
div
	a-row(:gutter="[16, 16]")
		a-col(:span="24")
			h1(class="nombre-local") {{ local.nombre }}
			.detalle-local {{ mesasLen }} mesas
			.detalle-local {{ localApoderadosLen }} apoderados
			.detalle-local Apoderado General: {{ local.apoderadoGeneral }}
			.status-icon.green
			.detalle-local(style="display: inline") Faltan {{ apoderadosFaltantes }} apoderados
	a-row(:gutter="[16, 16]")
		a-col(:span="24")
			a-button(class="button-red" block size="large" @click="toAsignarApoderadoGeneral")
				| Asignar Apoderado G
		a-col(:span="24")
			a-button(class="button-red" block size="large" @click="toReportes")
				| Reportes
		a-col(:span="24")
			a-button(class="button-border-blue" block size="large" @click="toAsingarApoderados")
				| Asignar Apoderados
	a-row(:gutter="[16, 10]")
		a-col(:span="24")
			h2(class="seccion-apoderados") Apoderados
	a-row(:gutter="[16, 16]")
		a-col(:span="24")
			a-input(v-model="buscar" placeholder="Buscar" size="large")
				a-icon(slot="prefix" type="search")
	a-row
		a-col
			a-row(v-for="(apoderado, index) in apoderadosFilter" :key="index" class="row-apoderado" type="flex" align="middle")
				a-col(:span="12" class="col-apoderado")
					| {{ apoderado.nombre }}
				a-col(:span="12" style="text-align: end"  class="col-apoderado")
					a-button(type="link" v-if="!apoderado.habilitado" class="button-success" @click="habilitarApoderado(apoderado.id)")
						| Habilitar
					a-button(type="link" v-else class="button-danger" @click="bloquearApoderado(apoderado.id)")
						| Bloquear

</template>

<script>
export default {
	name: 'ResumenLocal',
	data () {
		return {
			buscar: '',
			local: {
				nombre: '',
				mesas: [],
				apoderados: [],
				apoderadoGeneral: ''
			}
		}
	},
	computed: {
		mesasLen () {
			return this.local.mesas.length
		},
		localApoderadosLen () {
			return this.local.apoderados.length
		},
		apoderadosFaltantes () {
			return (this.mesasLen - this.localApoderadosLen) > 0
				? (this.mesasLen - this.localApoderadosLen)
				: 0
		},
		apoderadosFilter () {
			const buscar = this.buscar
			if (!buscar) return this.local.apoderados
			return this.local.apoderados.filter(apoderado => {
				return (apoderado.nombre.toLocaleLowerCase().search(buscar.toLocaleLowerCase()) > -1)
			})
		}
	},
	mounted () {
		this.getLocal()
	},
	methods: {
		// TODO: ir a asignar apoderado general
		toAsignarApoderadoGeneral () {
			console.warn('toAsignarApoderadoGeneral')
		},
		// TODO: ir a reportes
		toReportes () {
			console.warn('toReportes')
		},
		toAsingarApoderados () {
			const region = this.$route.params.region
			const localId = this.$route.params.localId
			this.$router.push('/app/locales/asignar-apoderado/' + region + '/' + localId)
		},
		// TODO: Bloquear Apoderado
		bloquearApoderado (apoderadoId) {
			console.warn('bloquearApoderado' + apoderadoId)
		},
		// TODO: Habilitar Apoderado
		habilitarApoderado (apoderadoId) {
			console.warn('habilitarApoderado' + apoderadoId)
		},
		async getLocal () {
			const region = this.$route.params.region
			const localId = this.$route.params.localId
			const response = await this.$cuentaBack.obtenerLocal({ region, localId })
			this.local.nombre = response.local.nombre
			this.local.apoderadoGeneral = 'Gabriel Boric'
			this.local.mesas = Object.values(response.local.mesas)
			this.local.apoderados = response.local.apoderades.map(apo => ({
				...apo,
				nombre: `usuarioID: ${apo.usuarioID}`
			}))
		}
	}
}
</script>

<style lang="sass" scoped>
@import '@style/paleta'
@import '@style/utils'

.nombre-local
	padding: 0 0 0 0
	font-style: normal
	font-weight: bold
	font-size: 24px
	line-height: 32px
	text-align: left
	/* Neutral/500 */
	color: #767676

.detalle-local
	color: #094C68
	font-size: 16px
	line-height: 1.7

.status-icon
	border-radius: 50%
	width: 20px
	height: 20px
	border: solid 4px $azul2
	margin-right: 5px
	display: inline-block
	vertical-align: middle

	&.green
		background-color: rgba(100,200,0,0.5)
	&.yellow
		background-color: rgba(200,200,0,0.5)
	&.orange
		background-color: rgba(200,100,0,0.5)
	&.red
		background-color: rgba(200,0,0,0.5)

.button-red
	background-color: #FF9999
	color: white

.button-border-blue
	border-color: #094C68
	color: #094C68

.seccion-apoderados
	color: #094C68
	font-size: 24px
	font-style: normal
	font-weight: bold
	text-align: center
	margin-bottom: 0

.row-apoderado
	border-bottom: 1.5px solid #094C68

.button-danger
	color: #FF9999

.button-success
	color: #A3CD9C

</style>
