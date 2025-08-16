import { ObjectId } from "mongodb";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import {
  ErrorEntidadAccionInvalida,
  ErrorRecursoNoEncontrado,
} from "../../../errores/clasesErrores";
import { ESTADOS_ENVIO } from "../schema";
import { EventoEnvio, evolucionarEnvio } from "../eventos";
import dayjs from "dayjs";
import { emitirEnvioDespachado } from "../rabbit/emitir";

export const despacharEnvio = async (envioId: string) => {
  const envio = await getColeccion(coleccionesMongo.envios).findOne({
    _id: new ObjectId(envioId),
  });

  if (!envio) throw new ErrorRecursoNoEncontrado("No se ha encontrado el envio");
  if (envio.estado !== ESTADOS_ENVIO.PENDIENTE_DE_DESPACHO)
    throw new ErrorEntidadAccionInvalida(
      "El estado del envio es " +
        envio.estado +
        ". Solo puedes despachar un envío que se encuentra pendiente de despacho."
    );

  const eventoEnvioDespachado: EventoEnvio & {
    nombreEvento: "EnvioDespachado";
  } = {
    agregadoId: envio._id.toHexString(),
    fyhEvento: new Date(),
    secuenciaEvento: 0,
    nombreEvento: "EnvioDespachado",
    contenido: {
      codigoEntrega: Math.random().toString().slice(2, 7),
      distanciaADestino: envio.distanciaTotal,
      fyhDespacho: new Date(),
      fyhEstimadaEntrega: dayjs().add(envio.duracionEstimadaViajeMins, "minutes").toDate(),
      ubicacionActual: envio.origen,
      recorrido: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: envio.origen.coordinates },
            properties: { fyhUbicacion: new Date() },
          },
        ],
      },
    },
  };
  const agregadoEvolucionado = evolucionarEnvio([eventoEnvioDespachado], envio);

  // Se guarda el evento
  await getColeccion(coleccionesMongo.eventosEnvios).insertOne(eventoEnvioDespachado);
  // Se actualiza la proyeccion del envio
  const envioDespachado = await getColeccion(coleccionesMongo.envios).findOneAndUpdate(
    { _id: envio._id },
    agregadoEvolucionado,
    { returnDocument: "after" }
  )!;
  void emitirEnvioDespachado({ envioId: envio._id.toHexString() });
  return envioDespachado;
};
