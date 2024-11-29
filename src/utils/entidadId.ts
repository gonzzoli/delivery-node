import { v7 as uuidv7 } from "uuid";
import { Etiquetado } from "./TaggedType";

export type EntidadId = Etiquetado<string, "EntidadId">;
export type AgregadoVersion = Etiquetado<number, "AgregadoVersion">;

export const generarIdEntidad = <T extends EntidadId>() => uuidv7() as T;
