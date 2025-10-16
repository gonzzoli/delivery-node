import z from "zod";
import { ExtraerRestDTO, numberZod, stringZod } from "../../utils/zodUtils";

export const schemaModificarArticuloDTO = z.object({
  params: z.object({ articuloId: stringZod("articuloId") }),
  body: z.object({
    pesoKg: numberZod("pesoKg"),
    largoM: numberZod("largoM"),
    anchoM: numberZod("anchoM"),
  }),
});

export type ModificarArticuloDTO = ExtraerRestDTO<typeof schemaModificarArticuloDTO>;
