import { NextFunction, Request, Response } from "express";
import { ErrorAutenticacion, ErrorAutorizacion } from "../errores/clasesErrores";
import { decode } from "jsonwebtoken";
import { coleccionesMongo, getColeccion } from "../config/bd";
import { ObjectId } from "mongodb";
import ComandosUsuario from "../dominio/usuario/comandos";
import axios from "axios";

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
      // Si no existia, al intentar actualizarlo ya se esta validando que el token sea valido tambien.
      // mediante la peticion a auth.
      if (!usuarioLocal || !usuarioLocal.enabled) {
        const usuarioCreadoActualizado = await ComandosUsuario.registrarActualizarUsuario(tokenJWT);
        // Si sigue estando disabled despues de actualizarlo, rechazamos
        if (!usuarioCreadoActualizado.enabled)
          throw new ErrorAutenticacion("Tu usuario esta deshabilitado");

        await getColeccion(coleccionesMongo.tokens).insertOne({
          _id: new ObjectId(tokenID),
          usuarioId: usuarioCreadoActualizado._id,
          enabled: true,
        });
        return;
      }

      req.usuario = usuarioLocal;

      // El usuario ya esta seguro en la bd local y enabled. Verificamos sus permisos ahora
      if (permisoRequerido && !usuarioLocal.permisos.includes(permisoRequerido))
        throw new ErrorAutorizacion();

      if (tokenLocal)
        if (!tokenLocal.enabled) throw new ErrorAutenticacion("El token ya no es valido");
        else return next();

      // No tenemos el tokenLocal, debemos probar que sea valido y luego almacenarlo o no.
      // Auth lanza err 401, asi que esto valida el token.
      await axios.get(`${process.env.AUTH_API_BASE_URL}/users/current`, {
        headers: { Authorization: `Bearer ${tokenJWT}` },
      });

      await getColeccion(coleccionesMongo.tokens).insertOne({
        _id: new ObjectId(tokenID),
        usuarioId: new ObjectId(userID),
        enabled: true,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
