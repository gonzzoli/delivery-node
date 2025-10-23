import { Request, Response } from "express";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { CodigosHTTP } from "../../../utils/codigosHTTP";
import { ObjectId, WithId } from "mongodb";
import { EnvioIdDTO } from "../dto";
import { Envio } from "../../../dominio/envio/schema";

export const buscarEnvio = async (req: Request, res: Response) => {
  const dto = req.datosValidados!.envioId as EnvioIdDTO;
  let envio: WithId<Envio> | null = await getColeccion(coleccionesMongo.envios).findOne({
    _id: new ObjectId(dto.envioId),
  });

  // Verificamos que sea el usuario que compra o que sea admin
  if (
    !req.usuario!.permisos.includes("admin") &&
    req.usuario!._id.toString() !== envio?.usuarioCompradorId
  )
    envio = null;

  res.status(envio ? CodigosHTTP.ACCEPTED : CodigosHTTP.NOT_FOUND).send(envio);
};
