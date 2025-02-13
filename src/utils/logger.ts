import pino from "pino";
import fs from "fs";

// Primero verificamos si existe la carpeta, y si no, la creamos. Si no existe crashea todo
const verificarExistenciaArchivosLog = () => {
  const rutaArchivo = `${__dirname}/../../logs`;
  if (!fs.existsSync(rutaArchivo)) fs.mkdirSync(rutaArchivo);
  const nombresLogs = ["info.log", "error.log"];
  nombresLogs.forEach((log) => {
    if (!fs.existsSync(`${rutaArchivo}/${log}`))
      fs.closeSync(fs.openSync(`${rutaArchivo}/${log}`, "a"));
  });
};
verificarExistenciaArchivosLog();

/**
 * Docs: https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-pino-to-log-node-js-applications/
 */
export const logger = pino({
  base: null,
  transport: {
    targets: [
      { target: "pino-pretty" },
      {
        target: "pino/file",
        level: "info",
        options: {
          destination: `${__dirname}/../../logs/info.log`,
          ignore: "pid,hostname",
        },
      },
      {
        target: "pino/file",
        level: "error",
        options: {
          destination: `${__dirname}/../../logs/error.log`,
          ignore: "pid,hostname",
        },
      },
    ],
  },
  timestamp: () => `,"time":"${new Date().toLocaleString()}"`,
});
