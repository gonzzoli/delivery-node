import { ObjectId } from "mongodb";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { ErrorRecursoNoEncontrado } from "../../../errores/clasesErrores";
import axios from "axios";
import { decode } from "jsonwebtoken";
import type { PayloadToken } from "../../../middlewares/validarUsuario";
import { Usuario } from "../schema";

type ResAuthCurrentUser = {
  id: string;
  name: string;
  permissions: Usuario["permisos"];
  login: string;
  enabled: boolean;
};

/** Recibe token JWT de un usuario. De existir el usuario localmente, busca sus datos mas recientes en Auth
 * y lo actualiza localmente. Si no existe, lo busca en Auth y lo registra.
 */
export const registrarActualizarUsuario = async (tokenJWT: string) => {
  const { userID } = decode(tokenJWT) as PayloadToken;
  // No hace falta verificar si caduco ya que no caducan
  const [usuarioLocal, reqUsuarioAuth] = await Promise.all([
    getColeccion(coleccionesMongo.usuarios).findOne({
      _id: new ObjectId(userID),
    }),
    axios.get<ResAuthCurrentUser>(`${process.env.AUTH_API_BASE_URL}/users/current`, {
      headers: { Authorization: `Bearer ${tokenJWT}` },
    }),
  ]);

  const usuarioAuth = reqUsuarioAuth.data;

  // Si no se encontro en auth que es el que centraliza los usuarios, decimos que no se encontro
  // ya que no podria crearse ni actualizarse en este microservicio
  if (!usuarioAuth)
    throw new ErrorRecursoNoEncontrado("No pudo encontrarse al usuario en el sistema");

  const datosUsuarioActualizado = {
    _id: new ObjectId(userID),
    nombre: usuarioAuth.name,
    usuario: usuarioAuth.login,
    enabled: usuarioAuth.enabled,
    permisos: usuarioAuth.permissions,
    // Datos no utilizados actualmente en el microservicio.
    ubicacion: null,
    provincia: null,
  };

  if (!usuarioLocal) {
    await getColeccion(coleccionesMongo.usuarios).insertOne(datosUsuarioActualizado);
    const usuarioCreado = (await getColeccion(coleccionesMongo.usuarios).findOne({
      _id: new ObjectId(userID),
    }))!;
    return usuarioCreado;
  } else {
    return (await getColeccion(coleccionesMongo.usuarios).findOneAndUpdate(
      { _id: new ObjectId(userID) },
      { $set: datosUsuarioActualizado },
      { returnDocument: "after" }
    ))!;
  }
};
