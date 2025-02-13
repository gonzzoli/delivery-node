import z from "zod";
import { ExtraerRestDTO, numberZod, stringZod } from "../../utils/zodUtils";

export const schemaCrearArticuloDTO = z.object({
  body: z.object({
    articuloId: stringZod("articuloId"),
    nombre: stringZod("nombre"),
    peso: numberZod("peso"),
    largo: numberZod("largo"),
    ancho: numberZod("ancho"),
  }),
});

export type CrearArticuloDTO = ExtraerRestDTO<typeof schemaCrearArticuloDTO>;

export const schemaActualizarArticuloDTO = z.object({
  params: z.object({ articuloId: stringZod("articuloId") }),
  body: z.object({
    nombre: stringZod("nombre"),
    peso: numberZod("peso"),
    largo: numberZod("largo"),
    ancho: numberZod("ancho"),
  }),
});

export type ActualizarArticuloDTO = ExtraerRestDTO<typeof schemaActualizarArticuloDTO>;
