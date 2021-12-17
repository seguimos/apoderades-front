

class Apoderade {
	constructor (datos) {
		const {
			nombre, 
			apellido, 
			email, 
			rut, 
			telefono, 
			territoriosAsignados, 
			territorioPreferencia
		} = datos
		this.nombre = nombre 
		this.apellido = apellido 
		this.email = email 
		this.rut = rut 
		this.telefono = telefono 
		this.territoriosAsignados = territoriosAsignados 
		this.territorioPreferencia = territorioPreferencia
	}
}


export default Apoderade