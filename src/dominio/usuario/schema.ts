import type { EntidadId } from "../../utils/entidadId";
import type { Etiquetado } from "../../utils/Etiquetado";
import type { Provincia, Punto } from "../envio/schema";

type UsuarioId = Etiquetado<EntidadId, "UsuarioId">;

export type Usuario = {
  usuarioId: UsuarioId;
  nombre: string;
  coordenadas: Punto;
  provincia: Omit<Provincia, "polilineaLimite">;
};
