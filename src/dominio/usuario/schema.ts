import { Point } from "geojson";
import type { EntidadId } from "../../utils/entidadId";
import type { Etiquetado } from "../../utils/Etiquetado";
import type { Provincia } from "../envio/schema";

type UsuarioId = Etiquetado<EntidadId, "UsuarioId">;

export type Usuario = {
  usuarioId: UsuarioId;
  nombre: string;
  coordenadas: Point;
  provincia: Omit<Provincia, "polilineaLimite">;
};
