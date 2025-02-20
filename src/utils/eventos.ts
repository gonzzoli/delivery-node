import { EntidadId } from "./entidadId";
import { Etiquetado } from "./Etiquetado";

/**
 * Forma que deben tener los eventos de los distintos agregados de la aplicacion.
 * Debe ser asi para mantener consistencia y porque todos se guardan en la misma tabla de la BD
 */
export type EventoAplicacion<
  AgregadoId extends EntidadId,
  NombreEvento extends string,
  Contenido extends Record<string, unknown> | null,
> = {
  _id: Etiquetado<string, "EventoAplicacionId">;
  agregadoId: AgregadoId;
  fyhEvento: Date;
  secuenciaEvento: number;
  nombreEvento: NombreEvento;
  contenido: Contenido;
};
export type CualquierEventoAplicacion = EventoAplicacion<
  EntidadId,
  string,
  Record<string, unknown> | null
>;

/**
 * Tipo a aplicar en los manejadores de eventos de cada agregado.
 */
export type ManejadorEvento<Agregado, Evento extends CualquierEventoAplicacion> = (
  estadoActual: Agregado | undefined,
  evento: Evento
) => Agregado;

export const evolucionarAgregado =
  <Agregado, EventosPosibles extends CualquierEventoAplicacion>(
    aplicarEvento: ManejadorEvento<Agregado, EventosPosibles>
  ) =>
  (eventos: EventosPosibles[]): Agregado => {
    let estadoActual: Agregado | undefined = undefined;

    for (const evento of eventos) {
      estadoActual = aplicarEvento(estadoActual, evento);
    }

    if (estadoActual === undefined)
      throw new Error("No se pudo generar el agregado desde los eventos");

    return estadoActual;
  };
