import { Envio } from "../../dominio/envio/schema";

export type ResCalcularEnvio = {
  distanciaKm: number;
  duracionEstimadaMins: number;
  precioTotalEnvio: number;
  pesoTotalEnvioKg: number;
  preciosPorArticulo: {
    articuloId: string;
    cantidad: number;
    pesoKg: number;
    largoM: number;
    anchoM: number;
    nombre: string;
    pesoTotalArticulosKg: number;
    precioCalculadoArticulos: number;
  }[];
};

export type ResBuscarEnvios = Omit<Envio, "recorrido">[];

export type ResBuscarEnvio = Envio;
