import express from "express";
import { conectarBD } from "./lib/bd";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import * as swagger from "./lib/docs";
import routerBase from "./rest";
import { logger } from "./utils/logger";
import { manejadorErrores } from "./middlewares/manejadorErrores";
import { config } from "dotenv";
config();

process.on("uncaughtException", (error) => {
  logger.fatal(error, "Error no capturado");
  apagarServidor();
});
process.on("SIGINT", apagarServidor);
process.on("SIGTERM", apagarServidor);
process.on("SIGKILL", apagarServidor);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swagger.generarDocsAPI(), swagger.opcionesSwagger)
);
app.use("/api", routerBase);

// Manejador de errores global. Si sucede un error
// en cualquier parte de otro middleware o controlador (dentro de sus servicios/repositorios, lo que sea)
// debe usarse next(error) para que sea atrapado por este manejador
// y se estructure el error de forma apropiada.
app.use(manejadorErrores);

const PUERTO_SERVIDOR = process.env.PUERTO_SERVIDOR;
const servidor = app.listen(PUERTO_SERVIDOR ?? 3000, async () => {
  try {
    await conectarBD();
    logger.info("Base de datos conectada y servidor iniciado en puerto " + PUERTO_SERVIDOR);
  } catch (error: unknown) {
    console.log(
      "No pudo conectarse a la base de datos. 5 intentos fallidos, debera revisarse manualmente el problema."
    );
  }
});


function apagarServidor() {
  console.log("Apagando servidor...");
  servidor.close(() => {
    console.log("Servidor apagado");
    process.exit(0);
  });

  servidor.closeAllConnections();

  setTimeout(() => {
    console.log("No se ha podido apagar el servidor en 5 segundos. Apagando forzosamente");
    process.exit(1);
  }, 5000);
}
