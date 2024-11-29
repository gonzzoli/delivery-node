import { Etiquetado } from "../../utils/TaggedType";
import uuid from "uuid";
import { FechaHora, FechaHoraAlta, FechaHoraBaja, EntidadId } from "../tipos";

// Esto mas que nada utilitario para usarlo como sea segun lo que representa el evento
export type FechaHoraEvento = FechaHora & FechaHoraAlta & FechaHoraBaja;

/**
 * Forma que deben tener los eventos de los distintos agregados de la aplicacion.
 * Debe ser asi para mantener consistencia y porque todos se guardan en la misma tabla de la BD
 */
export type EventoAplicacion<
  AgregadoTipo extends string,
  AgregadoId extends EntidadId,
  NombreEvento extends string,
  Contenido extends Record<string, unknown> | null,
> = {
  id: Etiquetado<string, "EventoAplicacionId">;
  agregadoId: AgregadoId;
  agregadoTipo: AgregadoTipo;
  fyhEvento: FechaHoraEvento;
  secuenciaEvento: number;
  nombreEvento: NombreEvento;
  contenido: Contenido;
};
export type CualquierEventoAplicacion = EventoAplicacion<
  string,
  EntidadId,
  string,
  Record<string, unknown> | null
>;

export const generarIdEvento = () =>
  uuid.v7() as CualquierEventoAplicacion["id"];

/**
 * Tipo a aplicar en los manejadores de eventos de cada agregado.
 */
export type ManejadorEvento<
  Agregado,
  Evento extends CualquierEventoAplicacion,
> = (estadoActual: Agregado | undefined, evento: Evento) => Agregado;

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

const registrarEvento = <Evento extends CualquierEventoAplicacion>(
  evento: Evento
) => {
  // insertar en mongo
};

const buscarEventosDeAgregado = <
  EventosAgregado extends CualquierEventoAplicacion,
>(
  agregadoId: string
) => {
  // buscar en mongo
};

const RepoEventosAplicacion = {
  registrarEvento,
  buscarEventosDeAgregado,
};

export default RepoEventosAplicacion;
