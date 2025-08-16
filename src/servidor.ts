import { config } from "dotenv";
config();
import express from "express";
import { conectarBD, desconectarBD } from "./config/bd";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import * as swagger from "./config/docs";
import routerBase from "./rest";
import { logger } from "./utils/logger";
import { manejadorErrores } from "./middlewares/manejadorErrores";
import { Server } from "http";
import { conectarRabbit } from "./config/rabbit";

process.on("uncaughtException", (error) => {
  logger.fatal(error, "Error no capturado");
  apagarServidor();
});
process.on("SIGINT", apagarServidor);
process.on("SIGTERM", apagarServidor);

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
let servidor: Server;

void (async () => {
  try {
    await conectarBD();
    await conectarRabbit();
    // Se importan para que se ejecuten, y asi ya tener instanciados los Exchange de consumo
    // y las funciones que los consumen.
    import("./dominio/envio/rabbit/consumir.js");
    import("./dominio/usuario/rabbit/consumir.js");
    servidor = app.listen(PUERTO_SERVIDOR);
    logger.info("Base de datos conectada y servidor iniciado en puerto " + PUERTO_SERVIDOR);
  } catch (error: unknown) {
    logger.error(
      error,
      "Ocurrió un error en la inicialización del servidor. Debera revisarse manualmente el problema."
    );
  }
})();

function apagarServidor() {
  logger.info("Apagando servidor...");
  desconectarBD()
    .then(() => logger.info("Base de datos desconectada"))
    .then(() => {
      servidor.closeAllConnections();
      servidor.close(() => {
        logger.info("Servidor apagado");
        process.exit(0);
      });
    })
    .catch((err) => logger.error(err, "Oucrrio un error al apagar el servidor"));

  setTimeout(() => {
    logger.info("No se ha podido apagar el servidor en 5 segundos. Apagando forzosamente");
    process.exit(1);
  }, 5000);
}
