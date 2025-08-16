import { ObjectId } from "mongodb";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { ErrorConflictoRecursoExistente } from "../../../errores/clasesErrores";

export const registrarUsuario = async (usuarioId: string) => {
  const usuarioExistente = await getColeccion(coleccionesMongo.usuarios).findOne({
    _id: new ObjectId(usuarioId),
  });

  if (usuarioExistente)
    throw new ErrorConflictoRecursoExistente("El usuario ya está registrado en el sistema");

  await getColeccion(coleccionesMongo.usuarios).insertOne({
    _id: new ObjectId(usuarioId),
    // Se sete luego mediante el endpoint de actualizacion
    ubicacion: null,
    provincia: null,
  });
};
