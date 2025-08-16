import { Point } from "geojson";
import { Provincia } from "../envio/schema";

export type Usuario = {
  ubicacion: Point | null;
  provincia: Provincia["nombre"] | null;
};
