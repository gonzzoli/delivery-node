/**
 * Para usar en funciones asincronas cuando se quiera simular un tiempo de espera.
 * Es solo poner await esperar(milisegundos) y listo
 */
const esperar = async (tiempo: number) => new Promise((resolve) => setTimeout(resolve, tiempo));

export default esperar;