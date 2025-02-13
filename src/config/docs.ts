// import * as yaml from "yaml";
// import * as fs from "fs";
import { version } from "../../package.json";
import { SwaggerUiOptions } from "swagger-ui-express";
import { OpenAPIRegistry, OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { OpenAPIObjectConfigV31 } from "@asteasolutions/zod-to-openapi/dist/v3.1/openapi-generator";
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { CodigosHTTP } from "../utils/codigosHTTP";
// Para agregar metodos y funcionalidades a zod que nos facilitan
// generar la documentacion de la API con swagger. Sobre todo la parte de schemas
// que vendria siendo la definicion de los datos que recibimos y devolvemos (los DTOs)
extendZodWithOpenApi(z);

// registroAPI es donde vamos a ir agregando en las distintas rutas y DTOs todos los schemas
// y endpoints necesarios. Y ese unico registro despues lo usamos para generar toda la documentacion
export const documentacionAPI = new OpenAPIRegistry();

const opcionesDocs: OpenAPIObjectConfigV31 = {
  openapi: "3.1.0",
  info: {
    title: "Isell Market API Docs",
    version,
    contact: {
      // ni hace falta contacto si esto va a ser interno para nosotros, pero bueno
      name: "Isell Market",
      email: "emaildeisell@gmail.com",
    },
  },
  // url base que se prefija a las rutas que usemos en las definiciones de los endpoints
  servers: [{ url: "http://localhost:3001/api" }],
};

// en esta solo se genera el objeto que contiene toda la especificacion
// de la api a partir de lo que hemos agregador a registroAPI
export const generarDocsAPI = () => {
  const generadorDoc = new OpenApiGeneratorV31(documentacionAPI.definitions);
  return generadorDoc.generateDocument(opcionesDocs);
};

/** Aca se agrega la opcion de seguridad para las rutas de swagger.
 * Si una ruta requiere autenticacion (token jwt) se especifica en el atributo security. security: [{ [bearerAPI.name]: [] }]
 * Con eso va a aparecer un candado en la peticion, que si tocamos nos permite ingresar el token que se enviara
 * en el header Authorization de la peticion.
 */
export const bearerAPI = documentacionAPI.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

export const opcionesSwagger: SwaggerUiOptions = {
  explorer: true,
};

// Y aca nada mas los nombres de los tags para que
// esten escritos todos igual y no tengamos que estar recordando.
export const TAGS_SWAGGER = {
  USUARIOS: "Usuarios",
  PRODUCTOS: "Productos",
  CATEGORIAS: "Categorias",
  ORDENES: "Ordenes",
  CARRITO: "Carrito",
  DIRECCIONES: "Direcciones",
} as const;

export const RespuestasErrorSwagger = {
  [CodigosHTTP.BAD_REQUEST]: {
    description: "Error en el envío de los datos. Revise los datos enviados.",
  },
  [CodigosHTTP.INTERNAL_SERVER_ERROR]: {
    description: "Error interno al buscar los datos.",
  },
};
