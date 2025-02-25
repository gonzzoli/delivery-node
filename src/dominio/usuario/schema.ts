import { Point } from "geojson";
import type { EntidadId } from "../../utils/entidadId";
import type { Etiquetado } from "../../utils/Etiquetado";

type UsuarioId = Etiquetado<EntidadId, "UsuarioId">;

export type Usuario = {
  usuarioId: UsuarioId;
  nombre: string;
  coordenadas: Point;
};
