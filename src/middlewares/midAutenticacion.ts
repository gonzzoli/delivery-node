import { NextFunction, Request, Response } from "express";
import { ErrorRecursoNoEncontrado } from "../utils/errores/clasesErrores";
import QueriesUsuario from "../contextos/usuarios/queries";
import { jwtVerify } from "@kinde-oss/kinde-node-express";

/**
 * Para utilizar en las rutas que necesitemos proteger. Agrega el dato id a req.user
 * que podemos utilizar para buscar el usuario en nuestra BD o en la API de Kinde si es necesario.
 */
export const verificadorKindeJWT = jwtVerify(process.env.KINDE_DOMAIN, {});

/** Aca agregamos simplemente la entidad de usuario del que realiza la petición.
 * Se pueden acceder esos datos en el controlador con req.usuario.
 */
export const agregarUsuarioARequest = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { datos: usuario } = await QueriesUsuario.buscarUsuarioPorKindeId(req.user!.id);
    // Esto no debería suceder nunca, pues ya verificamos con verificadorKindeJWT
    // que el usuario si está registrado en nuestro sistema.
    if (!usuario)
      throw new ErrorRecursoNoEncontrado(
        "No pudimos encontrar al usuario que está realizando la petición. Estás registrado?"
      );

    req.usuario = usuario;
    next();
  } catch (error) {
    // Si largo error de autenticacion, atrapamos y enviamos al manejador global.
    next(error);
  }
};

const validarUsuario = [verificadorKindeJWT, agregarUsuarioARequest];
export default validarUsuario;
