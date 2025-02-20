import { OrderPlacedData } from "../../rabbit/consumir";
import { EntidadId } from "../../utils/entidadId";
import { Etiquetado } from "../../utils/Etiquetado";
import { EventoAplicacion, evolucionarAgregado } from "../../utils/eventos";
import { Envio, Punto } from "./schema";

type EventoEnvioCreado = EventoAplicacion<
  Envio["envioId"],
  "EnvioCreado",
  Omit<Envio & { estado: "RETIRO PENDIENTE" }, "estado">
>;

type EventoEnvioDespachado = EventoAplicacion<"Envio", Envio["envioId"], "EnvioDespachado", null>;

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

type EventoEnvioCercanoADestino = EventoAplicacion<
  Envio["envioId"],
  "EnvioCercanoADestino",
  Envio
>;

type EventoEnvioNoPosible = EventoAplicacion<
  ,
  "EnvioNoPosible",
  { motivo: string }
>;

export type EventosEnvio =
  | EventoEnvioCreado
  | EventoEnvioDespachado
  | EventoEnvioEntregado
  | EventoEnvioUbicacionActualizada;

const evolucionarEnvio = evolucionarAgregado<Envio, EventosEnvio>((envio, evento) => {
  if (!envio) return evento.contenido;

  switch (evento.nombreEvento) {
    case "EnvioCreado":
      return { ...evento.contenido, estado: "PENDIENTE DE DESPACHO" };
    case "EnvioDespachado":
      return { ...evento.contenido, estado: "EN CAMINO" };
    case "EnvioEntregado":
      return { ...evento.contenido, estado: "ENTREGADO" };
    case "EnvioUbicacionActualizada":
      return { ...envio, ...evento.contenido };
      break;
  }
});
