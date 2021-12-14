import * as regionesChile from '@lib/chile'

const chile = {
	...regionesChile,
}

export default (ctx, inject) => {
	const { app, store } = ctx

	chile.localPorID = localID =>  {
		return store.state.locales[localID] || {}
	}

	inject('chile', chile)
	ctx.chile = chile
	app.chile = chile
}
