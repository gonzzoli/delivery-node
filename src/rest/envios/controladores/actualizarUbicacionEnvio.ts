import { Request, Response } from "express";
import { ActualizarUbicacionEnvioDTO } from "../dto";
import { coleccionesMongo } from "../../../config/bd";
import { Envio } from "../../../dominio/envio/schema";

// Dejo aca y comienzo primero por el generar envio de orden ,mediante rabbit
export const actualizarUbicacionEnvio = async (req: Request, res: Response) => {
  const dto = req.datosValidados as ActualizarUbicacionEnvioDTO;
  const envio = await coleccionesMongo.envios?.findOne({
    envioId: dto.envioId as Envio["envioId"],
  });
};
