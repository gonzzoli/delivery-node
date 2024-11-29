import z from "zod";

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
export const booleanZod = () =>
  z.enum(["true", "false"]).transform((valor) => valor === "true");

/*
 * Algunas funciones para construir DTOs de busqueda con filtros,
 * paginacion, y ordenamiento.
 */

export const paginacionZod = (cantPorPaginaPredeterminada?: number) =>
  z
    .object({
      cantidadPorPagina: numberZod("cantidad por pagina").positive(),
      pagina: numberZod("pagina").positive(),
    })
    .optional()
    .default({
      cantidadPorPagina: cantPorPaginaPredeterminada ?? 10,
      pagina: 1,
    });
export type OpcionesPaginacion = z.infer<ReturnType<typeof paginacionZod>>;

export type OpcionOrdenamiento = {
  nombre: string;
  tabla: string;
  columna: string;
};
/**
 * Deberia poder recibir un arreglo de objetos, para poder ordenar
 * primero por una cosa, y luego por otra, pero es complicado enviar un arreglo de objetos
 * en la query string, asi que solo recibimos un objeto y ordenamos por una sola columna
 */
export const ordenamientoZod = <T extends readonly OpcionOrdenamiento[]>(
  opcionesOrdenamiento: T,
  opcionPorDefecto: { orden: "asc" | "desc"; nombre: T[number]["nombre"] }
) =>
  z
    .object({
      orden: z.enum(["asc", "desc"]),
      // Siempre definimos al menos una opcion de ordenamiento al usar esta funcion, pero eso typescript no lo sabe
      // asi que ahi se lo aclaramos con el as [string,...string[]]
      nombre: z.enum(
        opcionesOrdenamiento.map((opcion) => opcion.nombre) as [
          T[number]["nombre"],
          ...T[number]["nombre"][],
        ]
      ),
    })
    .optional()
    .default(opcionPorDefecto);

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

/**
 * El ErrorMap global que se va a usar en todas las validaciones. Mas que nada para pasar de ingles a español los errores.
 * Puede ser sobreescrito en cada schema especifico si se desea.
 * Lo unico que modifica es el mensaje de error enviado. Lo demas (path, error_type, etc) lo deja como venia
 */
// Por ahora lo comento porque serian errores que solo los programadores o gente comunicandose desde otra API deberian ver.
// Vamos a validar los datos de nuestras aplicaciones ANTES de enviarlos, por lo que no deberian recibir errores de zod nuestra apps.
// const errorMapPersonalizadoZod: z.ZodErrorMap = (issue, ctx) => {
//   if (issue.code === z.ZodIssueCode.invalid_type)
//   return {message: `El valor de ${ctx.defaultError.} debe ser `}

//   return {message: ctx.defaultError}
// }
