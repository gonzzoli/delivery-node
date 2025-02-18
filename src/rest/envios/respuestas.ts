import { Envio } from "../../dominio/envio/schema";

export type ResCalcularEnvio = {
  distancia: number;
  costo: number;
  duracionEstimadaMins: number;
};

export type ResBuscarEnvios = Omit<Envio, "recorrido">[];

export type ResBuscarEnvio = Envio;
