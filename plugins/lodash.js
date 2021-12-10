import Vue from 'vue'
// import _ from 'lodash'
import { isEmpty, map, merge, get, filter, find, reverse, replace, mapValues, words, pickBy, includes, forEach, findIndex, lowerCase, isString, slice, pad, cloneDeep, concat, orderBy, pick } from 'lodash'
const _ = { isEmpty, map, merge, get, filter, find, reverse, replace, mapValues, words, pickBy, includes, forEach, findIndex, lowerCase, isString, slice, pad, cloneDeep, concat, orderBy, pick }

Vue.prototype._ = _



export default (ctx, inject) => {
	inject('lodash', _)
	const { app } = ctx
	ctx._ = ctx
	app._ = app
}
