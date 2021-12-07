<template>
	<div v-html="src" />
</template>
<script>
export default {
	name: 'Icon',
	props: {
		name: {
			type: String,
			required: true
		}
	},
	computed: {
		src () {
			const src = require(`static/logos/${this.name}.svg?raw`)
			return src
		}
	}
}
</script>
