import { Etiquetado } from "../utils/TaggedType";

export type EntidadId = Etiquetado<string, "EntidadId">;
export type AgregadoVersion = Etiquetado<number, "AgregadoVersion">;
export type FechaHora = Etiquetado<Date, "FechaHora">;
export type FechaHoraAlta = Etiquetado<FechaHora, "FechaHoraAlta">;
export type FechaHoraBaja = Etiquetado<FechaHora, "FechaHoraBaja"> | null;
