import { ObjectId } from "mongodb";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { ErrorConflictoRecursoExistente } from "../../../errores/clasesErrores";

// En realidad no es ni necesario registrar el usuario previamente en nuestro caso, ya que 
// no necesitamos su ubicacion de antemano. Tanto origen como destino se indican al momento
// de crear la orden, y ahi tambien viene el userId. Si no existe, lo creamos en ese momento.
// Pero lo dejo para tener un ejemplo mas de rabbit
export const registrarUsuario = async (usuarioId: string) => {
  const usuarioExistente = await getColeccion(coleccionesMongo.usuarios).findOne({
    _id: new ObjectId(usuarioId),
  });

  if (usuarioExistente)
    throw new ErrorConflictoRecursoExistente("El usuario ya está registrado en el sistema");

  await getColeccion(coleccionesMongo.usuarios).insertOne({
    _id: new ObjectId(usuarioId),
    // Se setea luego mediante el endpoint de actualizacion
    ubicacion: null,
    provincia: null,
  });
};
