import { FeatureCollection, Point, Polygon } from "geojson";
import { EntidadId } from "../../utils/entidadId";
import { Etiquetado } from "../../utils/Etiquetado";

// Definición de Ids
export type OrdenId = Etiquetado<EntidadId, "OrdenId">;
export type CarritoId = Etiquetado<EntidadId, "CarritoId">;

export type Parametro = {
  nombre: string;
  valor: number;
};

export type Provincia = {
  nombre: string;
  // Dato geografico para marcar el limite de la provincia. Usado para calcular el costo
  poligonoLimite: Polygon;
};

export type Articulo = {
  nombre: string;
  pesoKg: number;
  largoM: number;
  anchoM: number;
};

// Entidades
export const ESTADOS_ENVIO = {
  PENDIENTE_DE_DESPACHO: "PENDIENTE DE DESPACHO",
  EN_CAMINO: "EN CAMINO",
  ENTREGADO: "ENTREGADO",
} as const;
export type EstadoEnvio = (typeof ESTADOS_ENVIO)[keyof typeof ESTADOS_ENVIO];
export type EspecificacionArticuloEnvio = Articulo & {
  cantidad: number;
};

// fyh = Fecha y Hora
// Todos los puntos que ha registrado en cada actualizacion de ubicacion
export type RecorridoRealizadoEnvio = FeatureCollection<Point, { fyhUbicacion: Date }>;
export type Envio = {
  ordenId: OrdenId;
  usuarioCompradorId: string;
  origen: Point; // Indicado en el mensaje de order_placed
  destino: Point; // idealmente extraido del usuario comprador, pero como no lo tiene lo sacamos del order tamb
  duracionEstimadaViajeMins: number;
  distanciaTotalKm: number;
  fyhAlta: Date;
  costo: number;
  especificacion: EspecificacionArticuloEnvio[];
} & ( // Dependiendo del estado del envío serán las propiedades que tenga
  | {
      estado: typeof ESTADOS_ENVIO.PENDIENTE_DE_DESPACHO;
    }
  | {
      estado: typeof ESTADOS_ENVIO.EN_CAMINO;
      codigoEntrega: string;
      fyhEstimadaEntrega: Date;
      distanciaADestinoKm: number;
      fyhDespacho: Date;
      ubicacionActual: Point;
      recorrido: RecorridoRealizadoEnvio;
    }
  | {
      estado: typeof ESTADOS_ENVIO.ENTREGADO;
      fyhDespacho: Date;
      fyhEstimadaEntrega: Date;
      fyhEntrega: Date;
      recorrido: RecorridoRealizadoEnvio;
    }
);
