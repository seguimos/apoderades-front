<template lang="pug">
.paginaMiPerfil.anchoMovil

	.apoderade(v-if="$apoderade")
		.miniCabecera
			h3 Mi información de apoderado
			.usuarioID {{'#'}}{{$usuario.id}}

		a-alert(v-if="$apoderade.tieneAccesoNacional"
			message="Tienes acceso nacional" type="success" show-icon)
			div(slot="description")
				i Puedes:
				li Inscribir apoderados
				li Dar nivel de acceso de región a cualquier apoderado
				li Dar nivel de acceso de comuna a cualquier apoderado
				li Asignar local de votación a un apoderado para que ejerza como apoderado general o de mesa
				
		.asignaciones
			.microCabecera
				h4 Territorios que se me han encargado
			div(v-if="_.isEmpty($apoderade.territoriosAsignados)") 
				.info Nada aún.
			div(v-else) 
				div(v-for="terr in $apoderade.territoriosAsignados")
					miniTarjetaAsignacion(:territorioAsignado="terr")
				
		.localVotacion
			.microCabecera
				h4 Mi local de votación
			.sinTerritorios(v-if="_.isEmpty($apoderade.territorioPreferencia)") 
				.info No has seleccionado tu local de preferencia
			.territorios(v-else)
				//- div(v-for="")
				miniTarjetaLocal(:local="localDeVotacion")
				
							

	//- a-divider

	.persona(v-if="$usuario")
		.miniCabecera
			h3 Mis datos personales
			a-button(v-if="!decriptados" type="dashed" @click="mostrarDatosPersonales") Mostrar
			a-button(v-else type="primary" @click="decriptados = null") Ocultar

		transition(mode="out-in")
			.datosPersonales(v-if="decriptados" key="datosPersonales")
				.item
					.etiqueta Nombre:
					.texto {{decriptados.nombre}} {{decriptados.apellido}}
				.item
					.etiqueta RUT:
					.texto {{decriptados.rut || '-'}}
				.item
					.etiqueta Email:
					.texto {{decriptados.email || '-'}}
				.item
					.etiqueta Teléfono:
					.texto {{decriptados.telefono || '-'}}
			a-skeleton.esqueleto(v-else key="esqueleto")

	//- a-divider

	.cuenta
		a-button.w100(type="danger" @click="$cuenta.salir" ghost) Desconectarme


</template>
<script>
export default {
	data () {
		return {
			decriptados: undefined
		}
	},
	computed: {
		localDeVotacion () {
			const datosApoderade = this.$apoderade.territorioPreferencia
			return this.$cuentaBack.territorioAasignacion(datosApoderade)
		}
	},
	methods: {
		async mostrarDatosPersonales () {
			this.decriptados = await this.$cuenta.decriptarDatosPersonales()
		},
		asignacion (territorioAsignado) {
			const asig = {
				region: territorioAsignado.region && this.$chile.regionPorID(territorioAsignado.region),
				comuna: territorioAsignado.comunaCodigo && this.$chile.comunaPorID(territorioAsignado.comunaCodigo),
				local: territorioAsignado.localId && this.$chile.localPorID(territorioAsignado.localId),
				general: territorioAsignado.esApoderadoGeneral
			}
			asig.capa = asig.general ? 'general' : asig.local?  'mesa' : asig.comuna? 'comunal' : asig.region? 'regional' : '!>!?!??!'
			return asig
		}
	}
}
</script>
<style lang="sass" scoped>
@import '@style/vars'

.usuarioID
	opacity: .5
.miniCabecera
	margin-bottom: 1.4rem
	h3
		margin: 0
.microCabecera
	margin-bottom: 1rem
	h4 
		margin: 0

.asignaciones,
.localVotacion
	// border: 1px solid red
	margin-top: 2em

.persona,
.cuenta
	// border: 1px solid red
	margin-top: 4em


.persona
	.miniCabecera
		display: flex
		justify-content: space-between
		align-items: center
	h3
		margin: 0

	.esqueleto,
	.datosPersonales
		+saliendo
			max-height: 80vh
			overflow: hidden
		+salir
			opacity: 0
			max-height: 10vh
		.item
			.etiqueta
				opacity: .5
			.texto
				color: black
			+ .item
				margin-top: 0.5rem

</style>
