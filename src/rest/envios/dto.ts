import z from "zod";
import { ExtraerRestDTO, numberZod, schemaPuntoGeoJSONDTO, stringZod } from "../../utils/zodUtils";

export const schemaCalcularEnvioDTO = z.object({
  body: z.object({
    origenEnvio: schemaPuntoGeoJSONDTO,
    destinoEnvio: schemaPuntoGeoJSONDTO,
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
    coordenadas: schemaPuntoGeoJSONDTO,
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
