// con esto podemos agregar el objeto datosValidados al objeto req
// en nuestras rutas. Ese atributo debe ser siempre asignado en el middleware validarRequest

import { Usuario } from "../../../contextos/usuarios/entidades";

// y tendra los datos definidos en el schema Zod pasado como parametro
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      // campo agregado al usar middleware validarRequest
      datosValidados?: Record<string, unknown>;

      // campo agregado al usar middleware validarUsuario
      usuario?: Usuario;
    }
  }
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface ProcessEnv {
      [key: string]: string | undefined;
      PUERTO_SERVIDOR: number;
      MONGO_CONN_STRING: string;
      MONGO_DB_NAME: string;
      RABBIT_URL: string;
      CATALOG_API_BASE_URL: string;
    }
  }
}
