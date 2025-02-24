import { Request, Response } from "express";
import ComandosEnvio from "../../../dominio/envio/comandos";
import { ActualizarUbicacionEnvioDTO } from "../dto";
import { CodigosHTTP } from "../../../utils/codigosHTTP";

// Dejo aca y comienzo primero por el generar envio de orden ,mediante rabbit
export const actualizarUbicacionEnvio = async (req: Request, res: Response) => {
  const dto = req.datosValidados as ActualizarUbicacionEnvioDTO;
  const envioActualizado = await ComandosEnvio.actualizarUbicacionEnvio(
    dto.envioId,
    dto.coordenadas
  );

  res
    .status(envioActualizado ? CodigosHTTP.ACCEPTED : CodigosHTTP.NOT_FOUND)
    .send(envioActualizado);
};
