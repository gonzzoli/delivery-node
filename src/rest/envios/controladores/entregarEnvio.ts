import { Request, Response } from "express";
import { CodigosHTTP } from "../../../utils/codigosHTTP";
import { EntregarEnvioDTO } from "../dto";
import ComandosEnvio from "../../../dominio/envio/comandos";

export const entregarEnvio = async (req: Request, res: Response) => {
  const dto = req.datosValidados as EntregarEnvioDTO;
  const envioEntregado = await ComandosEnvio.entregarEnvio(dto.envioId, dto.codigoEntrega);

  res.status(envioEntregado ? CodigosHTTP.ACCEPTED : CodigosHTTP.NOT_FOUND).send(envioEntregado);
};
