import mongoDB from "mongodb";
import { logger } from "../utils/logger";

type ColeccionesBD = {
  envios?: mongoDB.Collection;
  usuarios?: mongoDB.Collection;
};

export const colecciones: ColeccionesBD = {};

export async function conectarBD() {
  const cliente: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.MONGO_CONN_STRING);
  await cliente.connect();
  const db = cliente.db(process.env.MONGO_DB_NAME);
  colecciones.envios = db.collection("envios");
  colecciones.usuarios = db.collection("usuarios");
  logger.info(`Conectado correctamente a la base de datos ${db.databaseName}`);
}
