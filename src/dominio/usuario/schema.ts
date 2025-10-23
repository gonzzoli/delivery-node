import { Point } from "geojson";
import { Provincia } from "../envio/schema";
import { ObjectId } from "mongodb";

export type Usuario = {
  nombre: string;
  usuario: string;
  enabled: boolean;
  permisos: ("admin" | "user")[];
  // Datos en desuso, eran inicialmente por si formaban parte del "perfil" del usuario
  // pero no, se terminan enviando por rabbit en createOrder
  ubicacion: Point | null;
  provincia: Provincia["nombre"] | null;
};

export type Token = {
  usuarioId: ObjectId;
  enabled: boolean;
};
