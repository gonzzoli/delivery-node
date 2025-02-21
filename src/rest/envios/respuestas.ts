import { Envio } from "../../dominio/envio/schema";

export type ResCalcularEnvio = {
  distancia: number;
  duracionEstimadaMins: number;
  precioTotalEnvio: number;
  pesoTotalEnvio: number;
  preciosPorArticulo: {
    articuloId: string;
    cantidad: number;
    peso: number;
    largo: number;
    ancho: number;
    nombre: string;
    pesoTotalArticulos: number;
    precioCalculadoArticulos: number;
  }[];
};

export type ResBuscarEnvios = Omit<Envio, "recorrido">[];

export type ResBuscarEnvio = Envio;
