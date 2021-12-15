<template lang="pug">
.miniTarjetaAsignacion.asignacion(v-if="asignacion")
	.encabezado
		.acciones
			//.paraMapa(v-if="['mesa', 'general'].includes(asignacion.capa)")
			.icono 🔖
		.info
			.rol
				span(v-if="asignacion.capa === 'regional'") Coordinación Regional
				span(v-else-if="asignacion.capa === 'comunal'") Coordinación Comunal
				span(v-else-if="asignacion.capa === 'general'") Apoderado General
				span(v-else-if="asignacion.capa === 'mesa'") Apoderado Mesa
				span(v-else) 
					.icono(style="font-size: 4em; margin-bottom: 1rem;") 🤨
					.texto Error

			.territorio
				span.region {{_.get(asignacion, ['region','nombre'])}}
				a-divider(type="vertical" v-if="asignacion.comunaID")
				span.comuna {{_.get(asignacion, ['comuna','nombre'])}}

		.acciones(v-if="mostrarDesasignar")
			a-popconfirm(v-if="puedeEliminarAsignacion" title="Eliminar asignación?" ok-text="Eliminar" cancel-text="No" placement="topRight" @confirm="$emit('desasignarTerritorio')")
				a-button(shape="circle")
					a-icon(type="close")
				div(slot="content")

	.miniTarjetaLocal(:class="asignacion.capa")
		.info
			.local 
				.nombre {{_.get(asignacion, ['local','nombre'])}}
				.direccion {{_.get(asignacion, ['local', 'direccion'])}}
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
	}
}
</script>
<style lang="sass" scoped>
@import '@style/vars'

.rol
	color: black
	+fwb
.miniTarjetaAsignacion
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

	.miniTarjetaLocal
		margin-top: 0.5rem
		display: flex
		align-items: center
		line-height: 1
		.info
			flex: auto 1 1
			line-height: 1.4

		&.mesa,
		&.general
			.region,
			.comuna
				// +fwb
				opacity: .65
			.local
				font-size: .8rem	
				.nombre
					color: black
					// +fwb
					margin: 0.25rem 0
				.direccion
					color: #333
					font-weight: lighter
</style>
