import { ObjectId } from "mongodb";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import {
  ErrorEntidadAccionInvalida,
  ErrorRecursoAjeno,
  ErrorRecursoNoEncontrado,
} from "../../../errores/clasesErrores";
import { ESTADOS_ENVIO } from "../schema";
import { EventoEnvio, evolucionarEnvio } from "../eventos";

export const entregarEnvio = async (envioId: string, codigoEntrega: string) => {
  const envio = await getColeccion(coleccionesMongo.envios).findOne({
    _id: new ObjectId(envioId),
  });

  if (!envio) throw new ErrorRecursoNoEncontrado("No se ha encontrado el envio");
  if (envio.estado !== ESTADOS_ENVIO.EN_CAMINO)
    throw new ErrorEntidadAccionInvalida(
      "El estado del envio es " +
        envio.estado +
        ". Solo puedes marcar como entregado un envio que se encuentra en camino."
    );

  if (envio.codigoEntrega !== codigoEntrega)
    throw new ErrorRecursoAjeno("El codigo de entrega del envío no coincide con el proporcionado");

  const eventoEnvioEntregado: EventoEnvio & {
    nombreEvento: "EnvioEntregado";
  } = {
    agregadoId: envio._id.toHexString(),
    fyhEvento: new Date(),
    secuenciaEvento: 0,
    nombreEvento: "EnvioEntregado",
    contenido: { fyhEntrega: new Date() },
  };
  const agregadoEvolucionado = evolucionarEnvio([eventoEnvioEntregado], envio);

  await getColeccion(coleccionesMongo.eventosEnvios).insertOne(eventoEnvioEntregado);
  const envioEntregado = await getColeccion(coleccionesMongo.envios).findOneAndUpdate(
    { _id: envio._id },
    agregadoEvolucionado,
    { returnDocument: "after" }
  );
  return envioEntregado;
};
