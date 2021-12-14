<template lang="pug">
.paginaMiPerfil.anchoMovil

	.apoderade(v-if="$apoderade")
		.miniCabecera
			h3 Mi información de apoderado

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
					.asignacion(v-for="asignacion in [$cuentaBack.territorioAasignacion(terr)]")
						strong(v-if="asignacion.capa === 'regional'") Coordinador Regional
						strong(v-else-if="asignacion.capa === 'comunal'") Coordinador Comunal
						strong(v-else-if="asignacion.capa === 'general'") Apoderado General
						strong(v-else-if="asignacion.capa === 'mesa'") Apoderado Mesa
						strong(v-else) 
							.icono(style="font-size: 4em; margin-bottom: 1rem;") 🤨
							strong '!>!?!??!'
							.texto Esto parece ser un error
						miniTarjetaLocal(:local="terr")
				
		.localVotacion
			.microCabecera
				h4 Mi local de votación
			.sinTerritorios(v-if="_.isEmpty($apoderade.territorioPreferencia)") 
				.info No has seleccionado tu local de preferencia
			.territorios(v-else)
				miniTarjetaLocal(:local="$apoderade.territorioPreferencia")
				
							

	//- a-divider

	.persona(v-if="$usuario")
		.miniCabecera
			h3 Mis datos personales

		.datosPersonales(v-if="!decriptados")
			a-button.w100(type="dashed" @click="mostrarDatosPersonales") Mostrar datos personales
		.datosPersonales(v-else)
			.item
				b Nombre:
				.texto {{decriptados.nombre}} {{decriptados.apellido}}
			.item
				b RUT:
				.texto {{decriptados.rut || '-'}}
			.item
				b Email:
				.texto {{decriptados.email || '-'}}
			.item
				b Teléfono:
				.texto {{decriptados.telefono || '-'}}

	//- a-divider

	.cuenta
		a-button.w100(@click="$cuenta.salir") Desconectarme


</template>
<script>
export default {
	data () {
		return {
			decriptados: undefined
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

.miniCabecera
	margin-bottom: 2em
	h3
		margin: 0
.microCabecera
	margin-bottom: 1em
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
	text-align: center
	h3
		margin: 0
</style>
