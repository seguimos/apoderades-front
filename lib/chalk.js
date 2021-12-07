function chalk (css, string, data = '') {
	let cssString = ''
	if (typeof css === 'string') {
		cssString = 'color:' + css
	} else {
		for (const key in css) {
			cssString = cssString + key + ':' + css[key] + ';'
		}
	}
	return console.log('%c' + string, cssString, data)
}

export default chalk
