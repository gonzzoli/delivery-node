import { Request, Response } from "express";
import { CodigosHTTP } from "../../../utils/codigosHTTP";
import { EnvioIdDTO } from "../dto";
import ComandosEnvio from "../../../dominio/envio/comandos";

export const despacharEnvio = async (req: Request, res: Response) => {
  const envioId = req.datosValidados!.envioId as EnvioIdDTO["envioId"];
  const envioDespachado = await ComandosEnvio.despacharEnvio(envioId);

  res.status(envioDespachado ? CodigosHTTP.ACCEPTED : CodigosHTTP.NOT_FOUND).send(envioDespachado);
};
