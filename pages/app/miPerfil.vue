<template lang="pug">
.paginaMiPerfil.comoMovil
	.cabecera
		h2 Mi perfil

	.persona(v-if="$usuario")
		.miniCabecera
			h3 Mis datos personales
		.datosPersonales
			.item
				b Nombre:
				.texto {{$usuario.nombre}} {{$usuario.apellido}}
			.item
				b RUT:
				.texto {{$usuario.rut}}
			.item
				b Email:
				.texto {{$usuario.email}}
			.item
				b Teléfono:
				.texto {{$usuario.telefono}}

	a-divider
	
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

	.cuenta
		a-button.w100(@click="$cuenta.salir") Desconectarme


</template>
<script>
export default {}
</script>
<style lang="sass" scoped>
</style>
