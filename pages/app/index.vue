<template lang="pug">
.root
	h1 Proto
	.errores(v-if="errorDatos")
		.texto {{ errorDatos }}
</template>
<script>
export default {
	data () {
		return {
			errorDatos: null
		}
	}
}
</script>
<style lang="sass" scoped></style>
