<template lang="pug">
.root
	p Hola mundo!
	div(v-if="bloqueado")
		h1 bloqueadaaaaaa
	div(v-else)
		h1 Permitidaaaa
		n-child
</template>

<script>
export default {
	data () {
		return {
			bloqueado: true
		}
	}
}
</script>
