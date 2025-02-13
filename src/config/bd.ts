import mongoDB from "mongodb";
import { logger } from "../utils/logger";
import { ErrorConexionBD } from "../errores/clasesErrores";

type ColeccionesBD = {
  envios?: mongoDB.Collection;
  usuarios?: mongoDB.Collection;
};

export const colecciones: ColeccionesBD = {};
export const cliente = new mongoDB.MongoClient(process.env.MONGO_CONN_STRING);

export async function conectarBD() {
  try {
    await cliente.connect();
    const db = cliente.db(process.env.MONGO_DB_NAME);
    colecciones.envios = db.collection("envios");
    colecciones.usuarios = db.collection("usuarios");
    logger.info(`Conectado correctamente a la base de datos ${db.databaseName}`);
  } catch (error) {
    logger.error(error, "Error conectando a la base de datos");
    throw new ErrorConexionBD((error as Error).message);
  }
}

export async function desconectarBD() {
  await cliente.close();
}
