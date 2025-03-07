import { ObjectId } from "mongodb";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { ESTADOS_ENVIO } from "../schema";
import {
  ErrorEntidadAccionInvalida,
  ErrorRecursoNoEncontrado,
} from "../../../errores/clasesErrores";
import { EventoEnvio, evolucionarEnvio } from "../eventos";
import { Point } from "geojson";
import turf from "@turf/turf";
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

  const distanciaADestino = turf.distance(nuevaUbicacion, envio.destino);

  const eventoUbicacionActualizada: EventoEnvio & {
    nombreEvento: "EnvioUbicacionActualizada";
  } = {
    agregadoId: envio._id.toHexString(),
    fyhEvento: new Date(),
    secuenciaEvento: 0,
    nombreEvento: "EnvioUbicacionActualizada",
    contenido: {
      fyhUbicacion: new Date(),
      ubicacion: nuevaUbicacion,
      distanciaADestino,
      fyhEstimadaEntrega: dayjs()
        .add(calcularDuracionEstimadaViajeMins(distanciaADestino), "days")
        .toDate(),
    },
  };
  const agregadoEvolucionado = evolucionarEnvio([eventoUbicacionActualizada], envio);

  await getColeccion(coleccionesMongo.eventosEnvios).insertOne(eventoUbicacionActualizada);
  const envioActualizado = await getColeccion(coleccionesMongo.envios).findOneAndUpdate(
    { _id: envio._id },
    agregadoEvolucionado,
    { returnDocument: "after" }
  );
  if (distanciaADestino <= 100)
    void emitirEnvioCercanoADestino({
      envioId: envio._id.toHexString(),
      distanciaRestanteKm: distanciaADestino,
      tiempoRestanteAproximadoMin: calcularDuracionEstimadaViajeMins(distanciaADestino),
    });
  return envioActualizado;
};
