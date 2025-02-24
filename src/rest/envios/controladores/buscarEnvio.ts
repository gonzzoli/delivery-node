import { Request, Response } from "express";
import { coleccionesMongo } from "../../../config/bd";
import { CodigosHTTP } from "../../../utils/codigosHTTP";
import { ObjectId } from "mongodb";
import { EnvioIdDTO } from "../dto";

export const buscarEnvio = async (req: Request, res: Response) => {
  const dto = req.datosValidados!.envioId as EnvioIdDTO;
  const envio = await coleccionesMongo.envios?.findOne({
    _id: new ObjectId(dto.envioId),
  });

  res.status(envio ? CodigosHTTP.ACCEPTED : CodigosHTTP.NOT_FOUND).send(envio);
};
