<template lang="pug">
.miniTarjetaAsignacion.asignacion(v-if="asignacion" :class="{activa}")
	.encabezado(@click="cambiarVisibilidad")
		.acciones
			//.paraMapa(v-if="['mesa', 'general'].includes(asignacion.capa)")
			.icono 🔖
			
			//a-popconfirm(v-if="mostrarDesasignar &&puedeEliminarAsignacion" title="Eliminar asignación?" ok-text="Eliminar" cancel-text="No" placement="topRight" @confirm="$emit('desasignarTerritorio')")
				.icono ❌
				div(slot="content")
		.info
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
				.direccion {{_.get(asignacion, ['local', 'direccion'])}}
	transition
		.contenido(v-if="activa") 


			a-popconfirm(v-if="mostrarDesasignar && puedeEliminarAsignacion" title="Eliminar asignación?" ok-text="Eliminar" okType="danger" cancel-text="No" placement="topRight" @confirm="$emit('desasignarTerritorio')")
				a-button.w100(type="danger") Eliminar
				div(slot="content")
			a-button.w100(v-else-if="mostrarDesasignar" type="danger" disabled) Eliminar


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
		mostrarDesasignar: {
			type: Boolean
		},
		activada: {
			type: Boolean
		},
		activable: {
			type: Boolean,
			default: false
		},
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
	methods: {
		cambiarVisibilidad () {
			this.activa = !this.activa
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
			font-size: 1.1em
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
					font-size: 1.1em
	.local
		.nombre
			opacity: 1
			text-transform: capitalize
			+fwn
			font-size: 1.1em
		.direccion
			opacity: .8
			+fwl


	//border: 1px solid transparent
	border-radius: 4px
	transition: all .3s ease
	padding: 0.3em
	.contenido
		// margin: 0.3em
		border-radius: inherit
		background-color: white
		padding: 1em
		transition: all .3s ease
		margin-top: 1em
		+saliendo
			max-height: 20em
			overflow: hidden
		+salir
			max-height: 0
			padding-top: 0
			padding-bottom: 0
			margin-top: 0
			// margin: 0 .3em
	&.activa
		background-color: $azul1
		color: white
		//border-color: #566
</style>
