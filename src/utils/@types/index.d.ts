// con esto podemos agregar el objeto datosValidados al objeto req
// en nuestras rutas. Ese atributo debe ser siempre asignado en el middleware validarRequest
// y tendra los datos definidos en el schema pasado como parametro

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      // campo agregado al usar middleware validarRequest
      datosValidados?: Record<string, unknown>;
    }
  }
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
  }
}

// todos los errores que devuelva el servidor a las peticiones
// deberian tener este formato.
export type RespuestaError = {
  titulo: string;
  detalle: string;
  endpoint: string;
  codigo: number;
};

// el controlador no devuelve mas que un codigo http y un objeto de datos (body),
// por lo que eso es todo lo que el servicio le pasa.
/**
 * T es puramente un tipo que tiene como proposito principal compartirse con los demas microservicios
 * (copiar y pegar, lamentablemente, hasta no pagar npm) para indicar los errores que pueden suceder en cada endpoint y los datos que devuelve si todo sale bien.
 */
export type RespuestaServicio<T> = Promise<{
  codigoHTTP: number;
  datos?: T;
}>;
