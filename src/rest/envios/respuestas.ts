import { Envio } from "../../dominio/envio/schema";

export type ResCalcularEnvio = {
  distancia: number;
  duracionEstimadaMins: number;
  precioTotal: number;
  preciosPorArticulo: { articuloId: string; cantidad: number; nombre: string; precioCalculadoEnvio: number }[];
};

export type ResBuscarEnvios = Omit<Envio, "recorrido">[];

export type ResBuscarEnvio = Envio;
