const consoloff = {
	log: () => {},
	info: () => {},
	warn: () => {},
	error: () => {}
}

const consolo = process.env.MODO === 'dev' ? console : consoloff

export default consolo
