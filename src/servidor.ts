import express from "express";
import { conectarBD } from "./lib/bd/bd";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import * as swagger from "./config/swagger";
import routerContextos from "./contextos/endpoints";
// @ts-expect-error mal hecha la libreria de kinde
import { setupKinde } from "@kinde-oss/kinde-node-express";
import { kindeConfig } from "./lib/autenticacion/kinde";
import { logger } from "./utils/logger";
import { manejadorErrores } from "./middlewares/manejadorErrores";
import { config } from "dotenv";
config();

const app = express();

// Agrega toda la configuracion y las rutas /register /login /logout a la app.
setupKinde(kindeConfig, app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swagger.generarDocsAPI(), swagger.opcionesSwagger)
);
app.use("/api", routerContextos);

// Manejador de errores global. Si sucede un error
// en cualquier parte de otro middleware o controlador (dentro de sus servicios/repositorios, lo que sea)
// debe usarse next(error) para que sea atrapado por este manejador
// y se estructure el error de forma apropiada.
app.use(manejadorErrores);

const PUERTO_SERVIDOR = process.env.PUERTO_SERVIDOR;
app.listen(PUERTO_SERVIDOR ?? 3000, async () => {
  try {
    await conectarBD();
    logger.info("Base de datos conectada y servidor iniciado en puerto " + PUERTO_SERVIDOR);
  } catch (error: unknown) {
    console.log(
      "No pudo conectarse a la base de datos. 5 intentos fallidos, debera revisarse manualmente el problema."
    );
  }
});
