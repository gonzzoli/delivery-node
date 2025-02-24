import { FeatureCollection, LineString, Point } from "geojson";
import { EntidadId } from "../../utils/entidadId";
import { Etiquetado } from "../../utils/Etiquetado";
import { Usuario } from "../usuario/schema";

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
  polilineaLimite: LineString;
};

export type Articulo = {
  nombre: string;
  peso: number;
  largo: number;
  ancho: number;
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
  codigoEntrega: string;
  ordenId: OrdenId;
  usuarioCompradorId: Usuario["usuarioId"];
  origen: Point; // Indicado en el mensaje de order_placed
  destino: Point; // Extraido del usuario comprador
  fyhEstimadaEntrega: Date;
  fyhAlta: Date;
  costo: number;
  especificacion: EspecificacionArticuloEnvio[];
} & ( // Dependiendo del estado del envío serán las propiedades que tenga
  | {
      estado: typeof ESTADOS_ENVIO.PENDIENTE_DE_DESPACHO;
    }
  | {
      estado: typeof ESTADOS_ENVIO.EN_CAMINO;
      fyhDespacho: Date;
      ubicacionActual: Point;
      recorrido: RecorridoRealizadoEnvio;
    }
  | {
      estado: typeof ESTADOS_ENVIO.ENTREGADO;
      fyhDespacho: Date;
      fyhEntrega: Date;
      recorrido: RecorridoRealizadoEnvio;
    }
);
