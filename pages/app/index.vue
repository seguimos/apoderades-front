<template lang="pug">
.root
	h1 Proto
</template>
<script>
import axios from 'axios'
export default {
	mounted () {
		const u = this.buscarMisDatos()
		console.log('this.$token', this.$token)
		return u
	},
	methods: {
		async buscarMisDatos () {
			const apoderade = await axios({
				method: 'get',
				url: 'http://localhost:3001/apoderade',
				headers: ['Access-Control-Allow-Origin']
			})
			console.log('apoderade', apoderade)
		}
	}
}
</script>
<style lang="sass" scoped></style>
