import { Request, Response } from "express";
import ComandosEnvio from "../../../dominio/envio/comandos";
import { ActualizarUbicacionEnvioDTO } from "../dto";

// Dejo aca y comienzo primero por el generar envio de orden ,mediante rabbit
export const actualizarUbicacionEnvio = async (req: Request, res: Response) => {
  const envioActualizado = await ComandosEnvio.actualizarUbicacionEnvio(
    req.datosValidados as ActualizarUbicacionEnvioDTO
  );
};
