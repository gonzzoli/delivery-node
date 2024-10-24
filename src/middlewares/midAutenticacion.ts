import { NextFunction, Request, Response } from "express";
import { ErrorAutenticacion, ErrorRecursoNoEncontrado } from "../utils/errores/clasesErrores";

/** Aca agregamos simplemente la entidad de usuario del que realiza la petición.
 * Se pueden acceder esos datos en el controlador con req.usuario.
 */
export const validarUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization) throw new ErrorAutenticacion();

    const { datos: usuario } = await ServiciosUsuario.buscarUsuarioPorKindeId(req.user!.id);
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
