import { EventoAplicacion, evolucionarAgregado } from "../../utils/eventos";
import { Envio, ESTADOS_ENVIO, Punto, RecorridoRealizadoEnvio } from "./schema";

type EventoEnvioCreado = EventoAplicacion<
  Envio["envioId"],
  "EnvioCreado",
  Omit<Envio, "estado"> & { estado: typeof ESTADOS_ENVIO.PENDIENTE_DE_DESPACHO }
>;

type EventoEnvioDespachado = EventoAplicacion<
  Envio["envioId"],
  "EnvioDespachado",
  { fyhDespacho: Date; ubicacionActual: Punto; recorrido: RecorridoRealizadoEnvio }
>;

type EventoEnvioUbicacionActualizada = EventoAplicacion<
  Envio["envioId"],
  "EnvioUbicacionActualizada",
  { fyhUbicacion: Date; ubicacion: Punto }
>;

type EventoEnvioEntregado = EventoAplicacion<
  Envio["envioId"],
  "EnvioEntregado",
  { fyhEntrega: Date }
>;

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
    case "EnvioUbicacionActualizada":
      return {
        ...(envio as Envio & { estado: typeof ESTADOS_ENVIO.EN_CAMINO }),
        ...evento.contenido,
      };
    default:
      // Dado que es un Error (y no un custom error) no se le dará esta respuesta al cliente
      throw new Error(
        "Ocurrió un error en la lógica de evolución del agregado Envio. Por favor revisa la lógica del código"
      );
  }
});
