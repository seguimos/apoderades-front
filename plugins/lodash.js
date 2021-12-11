import Vue from 'vue'
import _ from 'lodash'
// import { isEmpty, isArray, map, merge, get, filter, find, reverse, replace, mapValues, words, pickBy, includes, forEach, findIndex, lowerCase, isString, slice, pad, cloneDeep, concat, orderBy, pick } from 'lodash'
// const _ = { isEmpty, isArray, map, merge, get, filter, find, reverse, replace, mapValues, words, pickBy, includes, forEach, findIndex, lowerCase, isString, slice, pad, cloneDeep, concat, orderBy, pick }

Vue.prototype._ = _

export {
	_
}

export default (ctx, inject) => {
	inject('lodash', _)
	const { app } = ctx
	ctx._ = ctx
	app._ = app
}
