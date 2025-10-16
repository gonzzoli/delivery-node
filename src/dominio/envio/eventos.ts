import { Point } from "geojson";
import { EventoAplicacion, evolucionarAgregado } from "../../utils/eventos";
import { Envio, ESTADOS_ENVIO, RecorridoRealizadoEnvio } from "./schema";
import { coleccionesMongo, getColeccion } from "../../config/bd";
import { ErrorRecursoNoEncontrado } from "../../errores/clasesErrores";

type EventoEnvioCreado = EventoAplicacion<
  "EnvioCreado",
  Omit<Envio, "estado"> & { estado: typeof ESTADOS_ENVIO.PENDIENTE_DE_DESPACHO; _id: string }
>;

type EventoEnvioDespachado = EventoAplicacion<
  "EnvioDespachado",
  {
    fyhDespacho: Date;
    fyhEstimadaEntrega: Date;
    ubicacionActual: Point;
    codigoEntrega: string;
    recorrido: RecorridoRealizadoEnvio;
    distanciaADestinoKm: number;
  }
>;

type EventoEnvioUbicacionActualizada = EventoAplicacion<
  "EnvioUbicacionActualizada",
  {
    fyhUbicacion: Date;
    ubicacionActual: Point;
    fyhEstimadaEntrega: Date;
    distanciaADestinoKm: number;
  }
>;

type EventoEnvioEntregado = EventoAplicacion<"EnvioEntregado", { fyhEntrega: Date }>;

export type EventoEnvio =
  | EventoEnvioCreado
  | EventoEnvioDespachado
  | EventoEnvioEntregado
  | EventoEnvioUbicacionActualizada;

export const evolucionarEnvio = evolucionarAgregado<Envio, EventoEnvio>((envio, evento) => {
  if (!envio) return evento.contenido as EventoEnvioCreado["contenido"];

  switch (evento.nombreEvento) {
    case "EnvioCreado":
      return { ...evento.contenido, estado: "PENDIENTE DE DESPACHO" };
    case "EnvioDespachado":
      return {
        ...(envio as Envio & { estado: typeof ESTADOS_ENVIO.PENDIENTE_DE_DESPACHO }),
        ...evento.contenido,
        estado: "EN CAMINO",
      };
    case "EnvioEntregado":
      return {
        ...(envio as Envio & { estado: typeof ESTADOS_ENVIO.EN_CAMINO }),
        ...evento.contenido,
        estado: "ENTREGADO",
      };
    case "EnvioUbicacionActualizada": {
      const envioEnCamino = envio as Envio & { estado: typeof ESTADOS_ENVIO.EN_CAMINO };
      return {
        ...envioEnCamino,
        ...evento.contenido,
        recorrido: {
          type: "FeatureCollection",
          features: envioEnCamino.recorrido.features.concat([
            {
              type: "Feature",
              geometry: evento.contenido.ubicacionActual,
              properties: {
                fyhUbicacion: evento.contenido.fyhUbicacion,
              },
            },
          ]),
        },
      };
    }

    default:
      // Dado que es un Error (y no un custom error) no se le dará esta respuesta al cliente
      throw new Error(
        "Ocurrió un error en la lógica de evolución del agregado Envio. Por favor revisa la lógica del código"
      );
  }
});

/** Busca el ultimo evento del envio con el id pasado por parametro y lo devuelve.
 * Si no encuentra ningun evento devuelve null (deberia siempre encontrar al menos el de creacion)
 */
export const obtenerUltimoEventoEnvio = async (envioId: string) => {
  const ultimoEvento = await getColeccion(coleccionesMongo.eventosEnvios)
    .find({
      agregadoId: envioId,
    })
    .sort({ secuenciaEvento: -1 })
    .limit(1)
    .next();
  if (!ultimoEvento)
    throw new ErrorRecursoNoEncontrado(
      "No se han encontrado eventos para el envio de id " + envioId
    );
  return ultimoEvento;
};
