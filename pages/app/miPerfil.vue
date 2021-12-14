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
					.asignacion(v-for="asignacion in [asignacion(terr)]")
						.coordinadorRegional(v-if="asignacion.capa === 'regional'")
							strong Coordinador Regional
							.region {{_.get(asignacion, ['region','nombre'])}}
						.coordinadorComunal(v-else-if="asignacion.capa === 'comunal'")
							strong Coordinador Comunal
							.region {{_.get(asignacion, ['region','nombre'])}}
							.comuna {{_.get(asignacion, ['comuna','nombre'])}}
						.apoderadoGeneral(v-else-if="asignacion.capa === 'general'")
							strong Apoderado General
							.region {{_.get(asignacion, ['region','nombre'])}}
							.comuna {{_.get(asignacion, ['comuna','nombre'])}}
							.local {{_.get(asignacion, ['local','nombre'])}}
						.apoderadoMesa(v-else-if="asignacion.capa === 'mesa'")
							strong Apoderado Mesa
							.region {{_.get(asignacion, ['region','nombre'])}}
							.comuna {{_.get(asignacion, ['comuna','nombre'])}}
							.local {{_.get(asignacion, ['local','nombre'])}}
						.dobleveteefe(v-else) 
							.icono(style="font-size: 4em; margin-bottom: 1rem;") 🤨
							strong '!>!?!??!'
							.texto Esto parece ser un error
				
		.territorioPreferencia
			.microCabecera
				h4 Mi local de votación
			.sinTerritorios(v-if="_.isEmpty($apoderade.territorioPreferencia)") 
				.info No has seleccionado tu local de preferencia
			.territorios(v-else) 
				.asignacion(v-for="asignacion in [asignacion($apoderade.territorioPreferencia)]")
					.territorio
						span.region {{_.get(asignacion, ['region','nombre'])}}
						a-divider(type="vertical")
						span.comuna {{_.get(asignacion, ['comuna','nombre'])}}
					.local 
						.nombre {{_.get(asignacion, ['local','nombre'])}}
						.ubicacion
							.direccion {{_.get(asignacion, ['local','ubicacion', 'direccion'])}}
							.acciones
								.icono(style="font-size: 4em; margin-bottom: 1rem;") 🗺
							

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
.persona
	display: flex
	flex-flow: column nowrap
	justify-content: center
	align-items: center
	text-align: center
	h3
		margin: 0 0 1em
</style>
