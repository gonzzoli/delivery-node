import { ObjectId } from "mongodb";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { ESTADOS_ENVIO } from "../schema";
import {
  ErrorEntidadAccionInvalida,
  ErrorRecursoNoEncontrado,
} from "../../../errores/clasesErrores";
import { EventoEnvio, evolucionarEnvio, obtenerUltimoEventoEnvio } from "../eventos";
import { Point } from "geojson";
import * as turf from "@turf/turf";
import { calcularDuracionEstimadaViajeMins } from "../queries/calcularEnvio";
import dayjs from "dayjs";
import { emitirEnvioCercanoADestino } from "../rabbit/emitir";

export const actualizarUbicacionEnvio = async (envioId: string, nuevaUbicacion: Point) => {
  const envio = await getColeccion(coleccionesMongo.envios).findOne({
    _id: new ObjectId(envioId),
  });

  if (!envio) throw new ErrorRecursoNoEncontrado("No se ha encontrado el envio");
  if (envio.estado !== ESTADOS_ENVIO.EN_CAMINO)
    throw new ErrorEntidadAccionInvalida(
      "El estado del envio es " +
        envio.estado +
        ". Solo puedes actualizar la ubicación de un envio que se encuentra en camino."
    );

  const distanciaADestinoKm = turf.distance(nuevaUbicacion, envio.destino);

  // Buscamos el ultimo evento generado para obtener la secuencia correcta
  const ultimoEvento = await obtenerUltimoEventoEnvio(envio._id.toHexString());

  const eventoUbicacionActualizada: EventoEnvio & {
    nombreEvento: "EnvioUbicacionActualizada";
  } = {
    agregadoId: envio._id.toHexString(),
    fyhEvento: new Date(),
    secuenciaEvento: ultimoEvento.secuenciaEvento + 1,
    nombreEvento: "EnvioUbicacionActualizada",
    contenido: {
      fyhUbicacion: new Date(),
      ubicacionActual: nuevaUbicacion,
      distanciaADestinoKm,
      fyhEstimadaEntrega: dayjs()
        .add(calcularDuracionEstimadaViajeMins(distanciaADestinoKm), "days")
        .toDate(),
    },
  };
  const agregadoEvolucionado = evolucionarEnvio([eventoUbicacionActualizada], envio);

  await getColeccion(coleccionesMongo.eventosEnvios).insertOne(eventoUbicacionActualizada);
  const envioActualizado = await getColeccion(coleccionesMongo.envios).findOneAndUpdate(
    { _id: envio._id },
    { $set: agregadoEvolucionado },
    { returnDocument: "after" }
  );
  // Regla de negocio, posiblemente para un servicio de notificaciones
  if (distanciaADestinoKm <= 100)
    void emitirEnvioCercanoADestino({
      envioId: envio._id.toHexString(),
      distanciaRestanteKm: distanciaADestinoKm,
      tiempoRestanteAproximadoMin: calcularDuracionEstimadaViajeMins(distanciaADestinoKm),
    });
  return envioActualizado;
};
