import z from "zod";
import { ExtraerRestDTO, numberZod, stringZod } from "../../utils/zodUtils";

export const schemaPunto = z
  .number()
  .array()
  .length(2)
  .transform((punto) => punto as [number, number]);

const schemaPuntoDTO = z.object({
  type: z.literal("Point"),
  coordinates: schemaPunto,
});

export const schemaCalcularEnvioDTO = z.object({
  body: z.object({
    origenEnvio: schemaPuntoDTO,
    destinoEnvio: schemaPuntoDTO,
    articulos: z
      .object({
        articuloId: stringZod("id del articulo"),
        cantidad: numberZod("cantidad del articulo").min(0),
      })
      .array()
      .min(1),
  }),
});

export type CalcularEnvioDTO = ExtraerRestDTO<typeof schemaCalcularEnvioDTO>;

export const schemaActualizarUbicacionEnvioDTO = z.object({
  params: z.object({ envioId: stringZod("id del envio") }),
  body: z.object({
    coordenadas: schemaPuntoDTO,
  }),
});

export type ActualizarUbicacionEnvioDTO = ExtraerRestDTO<typeof schemaActualizarUbicacionEnvioDTO>;

export const schemaEnvioIdParamsDTO = z.object({
  params: z.object({ envioId: stringZod("id del envio") }),
});

export type EnvioIdDTO = ExtraerRestDTO<typeof schemaEnvioIdParamsDTO>;

export const schemaEntregarEnvioDTO = schemaEnvioIdParamsDTO.extend({
  body: z.object({ codigoEntrega: stringZod("codigo de entrega del envio") }),
});

export type EntregarEnvioDTO = ExtraerRestDTO<typeof schemaEntregarEnvioDTO>;
