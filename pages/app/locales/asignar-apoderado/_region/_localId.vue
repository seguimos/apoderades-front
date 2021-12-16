<template lang="pug">
div
	a-row(:gutter="[16, 16]")
		a-col(:span="24")
			h1(class="nombre-local") {{ local.nombre }}
			.detalle-local Asignado {{ localApoderadosLen }}/{{ mesasLen }} apoderados en su local
	a-row(:gutter="[16, 10]")
		a-col(:span="24")
			h2(class="seccion-apoderados") Apoderados Asignados
	a-row(:gutter="[16, 16]")
		a-col(:span="24")
			a-input(v-model="buscarLocal" placeholder="Buscar" size="large")
				a-icon(slot="prefix" type="search")
	a-row(:gutter="[16, 10]")
		a-col
			a-row(v-for="(apoderado, index) in apoderadosLocalFilter" :key="index" class="row-apoderado" type="flex" align="middle")
				a-col(:span="12" class="col-apoderado")
					| {{ apoderado.nombre }}
				a-col(:span="12" style="text-align: end"  class="col-apoderado")
					a-button(type="link" class="button-danger" @click="removerApoderadoLocal(apoderado.usuarioID)")
						| Remover de Local
						a-icon(type="close")
	a-row(:gutter="[16, 10]" style="padding-top:16px")
		a-col(:span="24")
			h2(class="seccion-apoderados") Apoderados Comuna
	a-row(:gutter="[16, 16]")
		a-col(:span="24")
			a-input(v-model="buscarComuna" placeholder="Buscar" size="large")
				a-icon(slot="prefix" type="search")
	a-row
		a-col
			a-row(v-for="(apoderado, index) in apoderadosComunaFilter" :key="index" class="row-apoderado" type="flex" align="middle")
				a-col(:span="12" class="col-apoderado")
					| {{ apoderado.nombre }}
				a-col(:span="12" style="text-align: end"  class="col-apoderado")
					a-button(type="link" v-if="!!apoderado.localId" class="button-danger")
						| Asignado a Local
					a-button(type="link" v-else class="button-success" @click="agregarApoderadoLocal(apoderado.usuarioID)")
						| Disponible
						a-icon(type="plus")

</template>

<script>
export default {
	name: 'ResumenLocal',
	data () {
		return {
			buscarLocal: '',
			buscarComuna: '',
			local: {
				nombre: '',
				mesas: [],
				apoderadoGeneral: '',
				apoderados: [],
				ubicacion: {}
			},
			apoderadosComuna: []
		}
	},
	computed: {
		region () {
			return this.$route.params.region
		},
		comunaCodigo () {
			return this.local.ubicacion.comunaCodigo
		},
		localId () {
			return this.$route.params.localId
		},
		mesasLen () {
			return this.local.mesas.length
		},
		localApoderadosLen () {
			return this.apoderadosLocal.length
		},
		apoderadosLocal () {
			return this.local.apoderados
		},
		apoderadosLocalFilter () {
			const buscar = this.buscarLocal
			if (!buscar) return this.apoderadosLocal
			return this.apoderadosLocal.filter(apoderado => {
				return (apoderado.nombre.toLocaleLowerCase().search(buscar.toLocaleLowerCase()) > -1)
			})
		},
		apoderadosComunaFilter () {
			const buscar = this.buscarComuna
			const noAsignados = this.apoderadosComuna.filter(apoderado =>
				!this.apoderadosLocal.some(apoderadoLocal =>
					apoderadoLocal.usuarioID === apoderado.usuarioID
				)
			)
			if (!buscar) return noAsignados
			return noAsignados.filter(apoderado => {
				return (apoderado.nombre.toLocaleLowerCase().search(buscar.toLocaleLowerCase()) > -1)
			})
		}
	},
	mounted () {
		this.getLocal()
	},
	methods: {
		async removerApoderadoLocal (usuarioID) {
			const regionID = this.region
			const comunaID = this.comunaCodigo
			const localID = this.localId
			const payload = {
				usuarioID,
				regionID,
				comunaID,
				localID
			}
			const response = await this.$cuentaBack.desasignarTerritorio(payload)
			console.log('removerApoderadoLocal ' + usuarioID, response)
			await this.getLocal()
		},
		async agregarApoderadoLocal (usuarioID) {
			const regionID = this.region
			const comunaID = this.comunaCodigo
			const localID = this.localId
			const payload = {
				usuarioID,
				regionID,
				comunaID,
				localID
			}
			const response = await this.$cuentaBack.asignarTerritorio(payload)
			console.log('agregarApoderadoLocal ' + usuarioID, response)
			await this.getLocal()
		},
		apoderadoInLocal (apoderadoId) {
			return this.apoderadosLocal.some(apoderado => apoderado.id === apoderadoId)
		},
		async getLocal () {
			const region = this.region
			const localId = this.localId
			const response = await this.$cuentaBack.obtenerLocal({ region, localId })
			this.local._id = response.local._id
			this.local.nombre = response.local.nombre
			this.local.apoderadoGeneral = 'Gabriel Boric'
			this.local.mesas = Object.values(response.local.mesas)
			this.local.apoderados = response.local.apoderades.map(apo => ({
				...apo,
				nombre: `usuarioID: ${apo.usuarioID}`
			}))
			this.local.ubicacion = response.local.ubicacion
			const comunaCodigo = response.local.ubicacion.comunaCodigo
			const responseComuna = await this.$cuentaBack.apoderadosXcomuna(comunaCodigo)
			console.log(responseComuna, 'rc')
			this.apoderadosComuna = responseComuna.apoderadosDisponibles.map(apo => ({
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
