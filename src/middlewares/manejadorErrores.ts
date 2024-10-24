/* En un servicio vamos a hacer muchas cosas, de las cuales la mayoria puede lanzar un error.
Lo importante es que creemos errores significativos y que distingan especificamente el tipo de error,
para que luego desde este manejador podamos devolver un error coherente al usuario y registrar el error
para nuestros propios propositos de analisis.
*/

import { NextFunction, Response, Request } from "express";
import { logger } from "../utils/logger";
import {
  ErrorAplicacion,
  ErrorValidacionDTO,
} from "../utils/errores/clasesErrores";
import { CodigosHTTP } from "../utils/codigosHTTP";

// type ErrorServicio = {
//     codigoError:
// }

/**
 * Manejador que se va a utilizar en los servicios para mapear el error
 * con alguno de las respuestas correspondientes dependiendo de que tipo de error es.
 * @param error Lo que atrapa el catch. De tipo unknown porque el catch basicamente agarra cualquier cosa a la que se le haga throw,
 * incluso si no es un error. En la funcion se va filtrando segun el tipo del parametro error.
 */

export const manejadorErrores = (
  error: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  logger.error(error);
  if (error instanceof ErrorValidacionDTO) {
    res.status(error.codigoHTTP || CodigosHTTP.BAD_REQUEST).send({
      titulo: error.titulo,
      descripcion: error.message,
      // En realidad nombreError y codigoError identifican al error de la misma forma,
      // despues vemos si solo mandamos codigo o nombre o ambos
      codigoError: error.codigoIdentificacion,
      nombreError: error.name,
      endpoint: `${req.method} ${req.url}`,
      errores: error.errorZod.issues,
    });
    return;
  }
  if (error instanceof ErrorAplicacion) {
    res.status(error.codigoHTTP || CodigosHTTP.INTERNAL_SERVER_ERROR).send({
      titulo: error.titulo,
      descripcion: error.message,
      // En realidad nombreError y codigoError identifican al error de la misma forma,
      // despues vemos si solo mandamos codigo o nombre o ambos
      codigoError: error.codigoIdentificacion,
      nombreError: error.name,
      endpoint: `${req.method} ${req.url}`,
    });
    return;
  }
  // Por si se largo un error no capturado. Rarisimo el caso, pero bueno mejor que no se caiga la app
  if (error instanceof Error) {
    res.status(400).send({
      titulo:
        "Ocurrio un error indefinido. Comuniquese con el soporte tecnico. ???",
      detalle: "Telefono: 0800 llame ya",
      codigoError: 0,
      nombreError: error.name,
      endpoint: `${req.method} ${req.url}`,
    });
    return;
  }
  // Y si ninguno de esos if se cumple, osea que lo que se lanzo no era un error realmente (lo cual seria rarisimo)
  // enviamos un mensaje generico y urgente habria que ponerse a ver que paso.
  res.status(CodigosHTTP.INTERNAL_SERVER_ERROR).send({
    titulo: "Error de maxima urgencia mundial",
    detalle: "porfavor llamenos",
    codigoError: 666,
    endpoint: `${req.method} ${req.url}`,
  });
};
