import * as regionesChile from '@lib/chile'
import _ from 'lodash'

const chile = {
	...regionesChile,
}

export default (ctx, inject) => {
	const { app, store } = ctx

	chile.todosLosLocales = () =>  {
		return store.state.locales || {}
	}
	chile.localPorID = localID =>  {
		return store.state.locales[localID] || {}
	}
	chile.localesPorComunaID = comunaID =>  {
		const locales = store.state.locales
		return _.pickBy(locales, local => local.comunaID === comunaID)
	}

	inject('chile', chile)
	ctx.chile = chile
	app.chile = chile
}
