import { Request, Response } from "express";
import { CalcularEnvioDTO } from "../dto";
import { CodigosHTTP } from "../../../utils/codigosHTTP";
import QueriesEnvio from "../../../dominio/envio/queries";

export const calcularEnvio = async (req: Request, res: Response) => {
  const dto = req.datosValidados as CalcularEnvioDTO;
  const envioCalculado = await QueriesEnvio.calcularEnvio(dto);
  res.status(CodigosHTTP.ACCEPTED).send(envioCalculado);
};
