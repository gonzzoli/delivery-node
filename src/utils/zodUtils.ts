import z from "zod";

export type RestDTO = z.ZodObject<{
  query?: z.AnyZodObject;
  body?: z.AnyZodObject;
  params?: z.AnyZodObject;
  headers?: z.AnyZodObject;
}>;

export const schemaPunto = z
  .number()
  .array()
  .length(2)
  .transform((punto) => punto as [number, number]);

export const schemaPuntoGeoJSONDTO = z.object({
  type: z.literal("Point"),
  coordinates: schemaPunto,
});

export const numberZod = (nombreCampo: string) =>
  z.coerce.number({
    required_error: `El campo ${nombreCampo} es requerido.`,
    invalid_type_error: `El formato de '${nombreCampo}' no es válido, debe ingresar un numero.`,
  });

export const stringZod = (nombreCampo: string) =>
  z.string({
    required_error: `El campo ${nombreCampo} es requerido.`,
    invalid_type_error: `El formato de '${nombreCampo}' no es válido, debe ingresar texto.`,
  });

/** Para poder recibir strings por zod que deban ser true o false para booleanos.
 * No acepta otros valores para booleans. z.coerce.boolean() no funciona con strings pues internamente
 * hace Boolean(valor) si le damos con coerce, y Boolean("false") da true porque es string. Asi que usamos esto.
 * @param valorDefecto Lo que se pone en el campo si no envian nada de nada
 */
export const booleanZod = () => z.enum(["true", "false"]).transform((valor) => valor === "true");

// Para usar en endpoints que requieren muy pocos, 1 o 2, datos de entrada.
// Asi evitamos hacer todo un DTO y tipos para algo simple
export const paramsZod = (paramsEspecificos: z.ZodRawShape) =>
  z.object({
    params: z.object(paramsEspecificos),
  });
export const queryZod = (queryParamsEspecificos: z.ZodRawShape) =>
  z.object({
    query: z.object(queryParamsEspecificos),
  });
export const bodyZod = (bodyParamsEspecificos: z.ZodRawShape) =>
  z.object({
    body: z.object(bodyParamsEspecificos),
  });

export type ExtraerRestDTO<T extends RestDTO> = z.infer<T>["query"] &
  z.infer<T>["body"] &
  z.infer<T>["params"] &
  z.infer<T>["headers"];
