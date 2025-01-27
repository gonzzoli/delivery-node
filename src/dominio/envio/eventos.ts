import { EventoAplicacion, evolucionarAgregado } from "../../utils/eventos";
import { Envio, Punto } from "./schema";

type EventoEnvioCreado = EventoAplicacion<
  "Envio",
  Envio["envioId"],
  "EnvioCreado",
  Omit<Envio & { estado: "RETIRO PENDIENTE" }, "estado">
>;

type EventoEnvioDespachado = EventoAplicacion<"Envio", Envio["envioId"], "EnvioDespachado", null>;

type EventoEnvioUbicacionActualizada = EventoAplicacion<
  "Envio",
  Envio["envioId"],
  "EnvioUbicacionActualizada",
  { fyhUbicacion: Date; ubicacion: Punto }
>;

type EventoEnvioEntregado = EventoAplicacion<
  "Envio",
  Envio["envioId"],
  "EnvioEntregado",
  { fyhEntrega: Date }
>;

type EventoEnvioCercanoADestino = EventoAplicacion<
  "Envio",
  Envio["envioId"],
  "EnvioCercanoADestino",
  Envio
>;

type EventoEnvioNoPosible = EventoAplicacion<"Order", Orde, "EnvioNoPosible", { motivo: string }>;

type EventosEnvio =
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
