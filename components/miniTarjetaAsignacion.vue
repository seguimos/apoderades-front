<template lang="pug">
.miniTarjetaAsignacion.asignacion(v-if="asignacion" :class="{activa}")
	.encabezado.flex.aic.jcsb
		.acciones.f11(v-if="!sinIcono")
			.icono 🔖
		.info.f11
			.rol
				span(v-if="asignacion.capa === 'regional'") Coordinación Regional
				span(v-else-if="asignacion.capa === 'comunal'") Coordinación Comunal
				span(v-else-if="asignacion.capa === 'general'") Apoderado General
				span(v-else-if="asignacion.capa === 'mesa'") Apoderado Mesa
				span(v-else) 
					.icono(style="font-size: 4em; margin-bottom: 1rem;") 🤨
					.texto Error

			.territorio(v-if="['regional', 'comunal'].includes(asignacion.capa)")
				.region(:class="{ laImportante: asignacion.capa === 'regional' }") {{_.get(asignacion, ['region','nombreCompleto'])}}
				//- a-divider(type="vertical" v-if="asignacion.comunaID")
				.comuna(:class="{ laImportante: asignacion.capa === 'comunal' }") {{_.get(asignacion, ['comuna','nombre'])}}


			.local(v-if="['general', 'mesa'].includes(asignacion.capa)")
				.nombre {{_.get(asignacion, ['local','nombre'], '').toLowerCase()}}
				.direccion(v-if="!sinDireccion") {{_.get(asignacion, ['local', 'direccion'])}}
		.zonaAcciones.f00
			a-button(@click="cambiarVisibilidad"
				shape="circle" 
				:icon="activa ? 'close' : 'more'")

	transition
		.contenido(v-if="activa") 

			.irATerritorio

				div(v-if="asignacion.capa === 'regional'" title="Coordinación regional") 
					n-link.db.w100(:to="`/app/Chile/${asignacion.regionID}`" 
						v-if="$route.path !== `/app/Chile/${asignacion.regionID}`") 
						a-button.multilinea.w100.pointerNone(type="info" @click.prevent) 
							| Ir a {{_.get(asignacion, 'region.nombre', '')}}
				
				div(v-else-if="asignacion.capa === 'comunal'" title="Coordinación comunal") 
					n-link.db.w100(:to="`/app/Chile/${asignacion.regionID}/${asignacion.comunaID}`"
						v-if="$route.path !== `/app/Chile/${asignacion.regionID}/${asignacion.comunaID}`") 
						a-button.multilinea.w100.pointerNone(type="info" @click.prevent)
							| Ir a {{_.get(asignacion, 'comuna.nombre', '')}}
				
				div(v-else-if="asignacion.capa === 'general'" title="Apoderado general") 
					n-link.db.w100(:to="`/app/Chile/${asignacion.regionID}/${asignacion.comunaID}/${asignacion.localID}`"
						v-if="$route.path !== `/app/Chile/${asignacion.regionID}/${asignacion.comunaID}/${asignacion.localID}`") 
						a-button.multilinea.w100.pointerNone(type="info" @click.prevent)
							| Ir a {{_.get(asignacion, 'local.nombre', 'de otro local')}}
				
				div(v-else-if="asignacion.capa === 'mesa'" title="Apoderado de mesa") 
					n-link.db.w100(:to="`/app/Chile/${asignacion.regionID}/${asignacion.comunaID}/${asignacion.localID}`"
						v-if="$route.path !== `/app/Chile/${asignacion.regionID}/${asignacion.comunaID}/${asignacion.localID}`") 
						a-button.multilinea.w100.pointerNone(type="info" @click.prevent)
							| Ir a {{_.get(asignacion, 'local.nombre', 'de otro local')}}

			a-popconfirm(v-if="mostrarDesasignar && puedeEliminarAsignacion" title="Eliminar asignación?" ok-text="Eliminar" okType="danger" cancel-text="No" placement="topRight" @confirm="desasignarTerritorio()")
				a-button.boton.w100(type="danger") Desasignar
				div(slot="content")
			//a-button.boton.w100(v-else-if="mostrarDesasignar" type="danger" disabled) Desasignar


			//- div CONTENIDO
			//- div CONTENIDO
			//- div CONTENIDO
			//- div CONTENIDO
</template>
<script>
export default {
	props: {
		territorioAsignado: {
			type: Object,
			required: true
		},
		mostrarDesasignar: { type: Boolean },
		activada: { type: Boolean },
		sinDireccion: { type: Boolean },
		sinIcono: { type: Boolean },
		usuarioID: {
			type: String,
			required: false,
			default: null
		}
	},
	data () {
		return {
			activa: null
		}
	},
	computed: {
		asignacion () {
			return this.$cuentaBack.territorioAasignacion(this.territorioAsignado)
		},
		misAsignaciones () {
			return this.$apoderade.asignaciones
		},
		puedeEliminarAsignacion () {
			if (this.$apoderade.tieneAccesoNacional) return true
			const misAsignaciones = this.$apoderade.asignaciones
			if (this.asignacion.capa === 'regional') return false
			if (this.asignacion.capa === 'comunal') {
				const esSuCoordinadorRegional = this._.find(misAsignaciones || [], a => {
					return a.capa === 'regional' && a.regionID && a.regionID === this.asignacion.regionID
				})
				return esSuCoordinadorRegional
			}
			if (this.asignacion.capa === 'general') {
				const esSuCoordinadorRegional = this._.find(misAsignaciones || [], a => {
					return a.capa === 'regional' && a.regionID && a.regionID === this.asignacion.regionID
				})
				const esSuCoordinadorComunal = this._.find(misAsignaciones || [], a => {
					return a.capa === 'comunal' && a.comunaID && a.comunaID === this.asignacion.comunaID
				})
				return esSuCoordinadorRegional || esSuCoordinadorComunal
			}
			if (this.asignacion.capa === 'mesa') {
				const esSuCoordinadorRegional = this._.find(misAsignaciones || [], a => {
					return a.capa === 'regional' && a.regionID && a.regionID === this.asignacion.regionID
				})
				const esSuCoordinadorComunal = this._.find(misAsignaciones || [], a => {
					return a.capa === 'comunal' && a.comunaID && a.comunaID === this.asignacion.comunaID
				})
				const esSuApoderadoGeneral = this._.find(misAsignaciones || [], a => {
					return a.capa === 'general' && a.localID && a.localID === this.asignacion.localID
				})
				return esSuCoordinadorRegional || esSuCoordinadorComunal || esSuApoderadoGeneral
			}
			return false
		}
	},
	mounted () {
		if (this.activada) this.activa = true
	},
	methods: {
		cambiarVisibilidad () {
			this.activa = !this.activa
		},
		async desasignarTerritorio () {

			const usuarioID = this.usuarioID
			if (!usuarioID) {
				console.error('Se necesita usuarioID')
				return
			}
			const { regionID, comunaID, localID } = this.asignacion

			const r = await this.$cuentaBack.desasignarTerritorio({ usuarioID, regionID, comunaID, localID })
			console.log('apoderades/index desasignarTerritorio', r)
			const s = await this.$cuentaBack.obtenerApoderade(usuarioID)
			if (s && s.ok) this.$emit('asignacionEliminada')
		}
	}
}
</script>
<style lang="sass" scoped>
@import '@style/vars'

.miniTarjetaAsignacion
	color: black
	.encabezado
		display: flex
		align-items: center
		.acciones
			flex: auto 0 0
			.icono
				font-size: 2em
				padding: 0 .8rem 0 0
		.info
			flex: auto 1 1

	.info
		.rol
			opacity: 1
			+fwb
			// font-size: 1.1em
		.territorio
			display: flex
			flex-flow: column nowrap
			.region,
			.comuna
				// +fwb
				opacity: .8
				+fwl
				&.laImportante
					opacity: 1
					order: -1
					+fwn
					// font-size: 1.1em
	.zonaAcciones
		padding-left: 1em
	.local
		.nombre
			opacity: 1
			text-transform: capitalize
			+fwn
			// font-size: 1.1em
		.direccion
			opacity: .8
			+fwl


	//border: 1px solid transparent
	border-radius: 4px
	transition: all .3s ease
	padding: 0
	.encabezado
		transition: all .3s ease
	.contenido
		padding: .5em
		transition: all .3s ease
		margin-top: .3em
		+saliendo
			max-height: 20em
			overflow: hidden
		+salir
			max-height: 0
			padding-top: 0
			padding-bottom: 0
			margin-top: 0
			// margin: 0 .3em
		.iconoCerrador
			.icono
				font-size: 2em
				margin-bottom: 1em
				opacity: .5
	.irATerritorio .ant-btn
		margin-bottom: .5em
	&.activa
		// padding: .5em
		background-color: transparentize($azul1, .7)
		margin-bottom: 0.5em
		.encabezado
			padding: 1em
		// color: white
		//border-color: #566
</style>
