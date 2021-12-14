import * as regionesChile from '@lib/chile'

export default (ctx, inject) => {
	inject('chile', regionesChile)
	const { app } = ctx
	ctx.chile = regionesChile
	app.chile = regionesChile
}
