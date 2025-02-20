import z from "zod";
import { ExtraerRestDTO, numberZod, stringZod } from "../../utils/zodUtils";

export const schemaRegistrarArticuloDTO = z.object({
  params: z.object({ articuloId: stringZod("articuloId") }),
  body: z.object({
    peso: numberZod("peso"),
    largo: numberZod("largo"),
    ancho: numberZod("ancho"),
  }),
});

export type RegistrarArticuloDTO = ExtraerRestDTO<typeof schemaRegistrarArticuloDTO>;
