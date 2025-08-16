import { NextFunction, Request, Response } from "express";
import { ErrorAutenticacion } from "../errores/clasesErrores";
import { decode } from "jsonwebtoken";

type PayloadToken = { tokenID: string; userID: string };

export const validarUsuario = (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization) throw new ErrorAutenticacion();

    const { userID: usuarioId } = decode(req.headers.authorization.split(" ")[1]) as PayloadToken;

    req.usuarioId = usuarioId;

    next();
  } catch (error) {
    next(error);
  }
};
