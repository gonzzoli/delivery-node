import { Request, Response } from "express";
import { coleccionesMongo } from "../../../config/bd";
import { BuscarEnvioDTO } from "../dto";
import { Envio } from "../../../dominio/envio/schema";
import { CodigosHTTP } from "../../../utils/codigosHTTP";

export const buscarEnvio = async (req: Request, res: Response) => {
  const dto = req.datosValidados as BuscarEnvioDTO;
  const envio = await coleccionesMongo.envios?.findOne({
    envioId: dto.envioId as Envio["envioId"],
  });

  res.status(envio ? CodigosHTTP.ACCEPTED : CodigosHTTP.NOT_FOUND).send(envio);
};
