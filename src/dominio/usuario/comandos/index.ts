import { ObjectId } from "mongodb";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { Usuario } from "../schema";
import { ErrorConflictoRecursoExistente } from "../../../errores/clasesErrores";

export const registrarUsuario = async (usuario: Usuario) => {
  const usuarioExistente = await getColeccion(coleccionesMongo.usuarios).findOne({
    _id: new ObjectId(usuario.usuarioId),
  });

  if (usuarioExistente)
    throw new ErrorConflictoRecursoExistente("El usuario ya está registrado en el sistema");

  await getColeccion(coleccionesMongo.usuarios).insertOne(usuario);
};
