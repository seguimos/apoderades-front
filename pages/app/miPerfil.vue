<template lang="pug">
.paginaMiPerfil.comoMovil

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
				
		.territoriosAsignados
			.microCabecera
				h4 Territorios que se me han asignado
			.sinTerritorios(v-if="_.isEmpty($apoderade.territoriosAsignados)") 
				.info No se te ha asignado un territorio/local
			.territorios(v-else) 
				.territorio(v-for="terr in $apoderade.territoriosAsignados")
					p {{terr}}
				
		.territorioPreferencia
			.microCabecera
				h4 Territorios de mi preferencia
			.sinTerritorios(v-if="_.isEmpty($apoderade.territorioPreferencia)") 
				.info No has seleccionado tu local de preferencia
			.territorios(v-else) 
				div {{$apoderade.territorioPreferencia}}

	a-divider

	.persona(v-if="$usuario")
		.miniCabecera
			h3 Mis datos personales

		.datosPersonales(v-if="!decriptados")
			a-button(@click="mostrarDatosPersonales") Mostrar datos personales
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

	a-divider

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
		}
	}
}
</script>
<style lang="sass" scoped>
</style>
