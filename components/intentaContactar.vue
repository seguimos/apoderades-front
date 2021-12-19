<template lang="pug">
.componenteIntentaContactar
	a-modal(v-model="abierto" centered)
		.titular(slot="title")
			.subtitulo Información de contacto
			.titulo {{usuario.nombre}} {{usuario.apellido}}
		.contenido(v-if="usuario")
			//- .nombre {{usuario.nombre}} {{usuario.apellido}}

			.textualContacto
				.email(v-if="usuario.email")
					.textoCopiable
						span.usn Email: &nbsp
						span.loQueSeCopia {{usuario.email}}
				.telefono(v-if="usuario.telefono")
					.textoCopiable
						span.usn Teléfono: &nbsp
						span.loQueSeCopia {{usuario.telefono}}

			.asignaciones.my1em(v-if="!_.isEmpty(usuario.territoriosAsignados)")
				b Participa como:
				.elementoAsignacion.mt05em(v-for="terr in usuario.territoriosAsignados" )
					miniTarjetaAsignacion(:territorioAsignado="terr" :usuarioID="usuario.usuarioID" sinIcono sinMenu)

			.asignaciones.my1em(v-else)
				b No se le ha integrado como apoderado ni coordinador
				
			.asignaciones.my1em(v-else)
				b No se le ha integrado como apoderado ni coordinador


			.opcionesContacto
				.email(v-if="usuario.email")
					a.db.mt1em(:href="`mailto:${usuario.email}`") 
						a-button.pointerNone.w100(size="large" type="info") 📧 Escribir por email

				.telefono(v-if="usuario.telefono")
					a.db.mt1em(:href="`tel:${usuario.telefono}`" target="_blank") 
						a-button.pointerNone.w100(size="large" type="info") 📞 Llamar por teléfono

					a.db.mt1em(:href="`https://wa.me/${usuario.telefono}?text=Hola, soy ${$usuario.nombre || ''} ${$usuario.apellido || ''}`" target="_blank") 
						a-button.pointerNone.w100(size="large" type="info") 📱 Whatsapp

		.footer(slot="footer")
			a-button.w100(size="large" type="primary" @click="abierto = false") Cerrar
</template>
<script>
export default {
	data () {
		return {
			abierto: null,
		}
	},
	computed: {
		usuario () {
			return this.$cuentaBack.intentaContactar
		}
	},
	watch: {
		abierto (ahora, antes) {
			if (antes && !ahora) {
				setTimeout(() => {
					this.$cuentaBack.intentaContactar = null
				}, 350)
			}
		}
	},
	mounted () {
		this.$consolo.info('Intenta contactar montado')
		this.abierto = true
	}
}
</script>
<style lang="sass" scoped>

</style>
