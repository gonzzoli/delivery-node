import { Request, Response } from "express";
import { coleccionesMongo } from "../../../config/bd";
import { CodigosHTTP } from "../../../utils/codigosHTTP";

export const buscarEnvios = async (_req: Request, res: Response) => {
  const envios = await coleccionesMongo.envios?.find().toArray();
  res.status(CodigosHTTP.ACCEPTED).send(envios);
};
