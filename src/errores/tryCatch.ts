import { NextFunction, Request, Response } from "express";

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
