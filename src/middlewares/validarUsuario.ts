import { NextFunction, Request, Response } from "express";
import { ErrorAutenticacion, ErrorAutorizacion } from "../errores/clasesErrores";
import { decode } from "jsonwebtoken";
import { coleccionesMongo, getColeccion } from "../config/bd";
import { ObjectId, WithId } from "mongodb";
import ComandosUsuario from "../dominio/usuario/comandos";
import { Usuario } from "../dominio/usuario/schema";
import { AxiosError } from "axios";
import { CodigosHTTP } from "../utils/codigosHTTP";

export type PayloadToken = { tokenID: string; userID: string };

/** Middleware que valida la autenticacion del usuario.
 * Si el token ya esta invalidado, no lo autentica.
 * Si no existe el usuario o no esta enabled, intenta registrarlo/actualizarlo localmente usando el microservicio de Auth.
 * Si tras registro/actualizacion tiene enabled en false el usuario, no lo autentica.
 * Valida tambien los permisos del usuario para la accion que se va a realizar.
 */
export const validarUsuario =
  (permisoRequerido?: "admin" | "user") =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.headers.authorization) throw new ErrorAutenticacion();

      const tokenJWT = req.headers.authorization.split(" ")[1];
      const { userID, tokenID } = decode(tokenJWT) as PayloadToken;

      const [usuarioLocal, tokenLocal] = await Promise.all([
        getColeccion(coleccionesMongo.usuarios).findOne({ _id: new ObjectId(userID) }),
        getColeccion(coleccionesMongo.tokens).findOne({ _id: new ObjectId(tokenID) }),
      ]);

      let usuarioActualizado: WithId<Usuario> | null = usuarioLocal;

      // Si no esta el token, puede que no este el usuario o debamos actualizar sus permisos/datos
      if (!tokenLocal) {
        // Auth lanza err 401, asi que esto valida el token tambien.
        try {
          usuarioActualizado = await ComandosUsuario.registrarActualizarUsuario(tokenJWT);
        } catch (error) {
          if (error instanceof AxiosError && error.response?.status === CodigosHTTP.UNAUTHORIZED)
            throw new ErrorAutenticacion("El token no es valido");
          else throw error;
        }
        await getColeccion(coleccionesMongo.tokens).insertOne({
          _id: new ObjectId(tokenID),
          usuarioId: new ObjectId(userID),
          enabled: true,
        });
        validarEstadoYPermisosUsuario(usuarioActualizado, permisoRequerido);
      } else {
        // Si esta el tokenLocal, asumo que tambien ya hemos guardado al usuario localmente
        // Solo para dejar explicito que asumo que esta el usuario
        usuarioActualizado = usuarioActualizado!;
        if (!tokenLocal.enabled) throw new ErrorAutenticacion("El token ya no es valido");
        validarEstadoYPermisosUsuario(usuarioActualizado, permisoRequerido);
      }

      req.usuario = usuarioActualizado;
      next();
    } catch (error) {
      next(error);
    }
  };

const validarEstadoYPermisosUsuario = (usuario: Usuario, permisoRequerido?: "admin" | "user") => {
  if (!usuario.enabled) throw new ErrorAutenticacion("Tu usuario esta deshabilitado");
  else if (permisoRequerido && !usuario.permisos.includes(permisoRequerido))
    throw new ErrorAutorizacion("No tienes permiso para realizar esta accion");
};
