import pino from "pino";
import fs from "fs";

// Primero verificamos si existe la carpeta, y si no, la creamos. Si no existe crashea todo
const verificarExistenciaArchivosLog = () => {
  const rutaArchivo = `${__dirname}/../../logs`;
  if (!fs.existsSync(rutaArchivo)) fs.mkdirSync(rutaArchivo);
  if (!fs.existsSync(`${rutaArchivo}/app.log`))
    fs.closeSync(fs.openSync(`${rutaArchivo}/app.log`, "a"));
};
verificarExistenciaArchivosLog();

export const logger = pino(
  {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  },
  pino.destination(`${__dirname}/../../logs/app.log`)
);
