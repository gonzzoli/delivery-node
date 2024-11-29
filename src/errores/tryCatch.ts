import { NextFunction, Request, Response } from "express";
import { ErrorQueryBD, ErrorRepositorio } from "./clasesErrores";
import { MensajesErrorTabla } from "../../tipos/programacion/tiposError";
import { logger } from "../logger";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * En cada ruta englobamos al controlador con esta funcion. Lo ejecuta normalmente, pero si sucede
 * algun error en cualquier parte de su ejecucion, el error deberia "elevarse" o "bubble up" hasta aca,
 * que se lo va a pasar con next(error) al manejador de errores global definido en servidor.ts
 * @param controlador Controlador que maneja el endpoint
 * @returns void
 */
export const tryCatchControlador =
  (controlador: AsyncRequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controlador(req, res, next);
    } catch (error) {
      next(error);
    }
  };

/**
 * Encierra al repositorio, de forma de poder capturar los errores y mapearlos a su correspondiente mensaje de constraint si es que existe.
 * Sirve mas que nada para limpiar un poco el codigo de los repositorios. Hay que encerrarlos en este tryCatch, pero no hay que encerrar todo
 * en un try catch comun ni agarrar y lanzar el error ahi mismo ni nada. Solo queda la query que es lo importante.
 * @param query Funcion de consulta (buscar, insertar, actualizar, o eliminar) a ejecutar desde el repo, que podria lanzar error.
 * @param {MensajesErrorTabla} mensajesErrorTabla Mensajes de error que mapean a las constraints de la BD a errores entendibles y descriptivos.
 * @returns El mismo resultado que devuelve la funcion de consulta pasada como parametro
 */

export const tryCatchRepo = async <T>(
  query: () => Promise<T>,
  mensajesErrorTabla?: MensajesErrorTabla
): Promise<T> => {
  try {
    const resultado = await query();
    return resultado;
  } catch (error) {
    logger.error(error, "ERROR tryCatchRepo");
    if (error instanceof ErrorQueryBD)
      if (mensajesErrorTabla) throw new ErrorRepositorio(error, mensajesErrorTabla);
    else throw error;
    throw new Error("Ocurrio un error al realizar la accion.");
  }
};
