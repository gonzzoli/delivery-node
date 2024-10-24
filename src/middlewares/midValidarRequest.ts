/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ErrorValidacionDTO } from "../utils/errores/clasesErrores";

/**
 *
 * @param {AnyZodObject} schemaValidacion  El schema completo que hemos definido para el DTO que va a ser validado en esa ruta.
 * La definicion de ese schema debe ser un z.object con 4 propiedades opcionales, body, params, query, y headers. Cada una de esas
 * propiedades, si definidas, deben ser un z.object donde cada propiedad del objeto sera validada y comprobada que exista en la request enviada.
 * @returns Detalle de error si la validacion falla. Si esta bien, agrega la propiedad datosValidados al objeto req , donde estaran agrupados
 * todas las propiedades validadas (es decir, todos los atributos del z.object del body, junto a los del params, query, y headers).
 */
export const validarRequest =
  (schemaValidacion: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    // Esta funcion convierte el req al tipo de dato que tiene la validacion
    // es decir, si trae datos de mas los quita, y si faltan datos o no cumplen el schema
    // tira error.
    try {
      const datosTransformados = schemaValidacion.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      });
      // Y ahora devolvemos todos los datos en un solo objeto, destructurando cada key
      // de datosTransformados, por lo que quedamos con la union del DTO tal cual lo definimos
      req.datosValidados = Object.keys(datosTransformados).reduce(
        (objetoAcumulado: Record<string, unknown>, atributoActual) => {
          return {
            ...objetoAcumulado,
            ...datosTransformados[atributoActual],
          };
        },
        {}
      );
      next();
    } catch (error) {
      // si es por zod enviamos este error, aunque primero deberiamos hacerlo
      // mas descriptivo, despues lo hacemos
      if (error instanceof ZodError) {
        next(new ErrorValidacionDTO(error));
        return;
      }
      // si fallo otra cosa, enviamos error 500
      next(error);
      return;
    }
  };
