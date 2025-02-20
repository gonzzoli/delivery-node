import mongoDB, { Document } from "mongodb";
import { logger } from "../utils/logger";
import { ErrorConexionBD } from "../errores/clasesErrores";
import { Articulo, Envio, Parametro, Provincia, Usuario } from "../dominio/envio/schema";
import { EventosEnvio } from "../dominio/envio/eventos";

type ColeccionesBD = {
  envios?: mongoDB.Collection<Envio>;
  eventosEnvios?: mongoDB.Collection<EventosEnvio>;
  articulos?: mongoDB.Collection<Articulo>;
  usuarios?: mongoDB.Collection<Usuario>;
  provincias?: mongoDB.Collection<Provincia>;
  parametros?: mongoDB.Collection<Parametro>;
};

export const coleccionesMongo: ColeccionesBD = {};
export const cliente = new mongoDB.MongoClient(process.env.MONGO_CONN_STRING);

export async function conectarBD() {
  try {
    await cliente.connect();
    const db = cliente.db(process.env.MONGO_DB_NAME);
    coleccionesMongo.envios = db.collection("envios");
    coleccionesMongo.usuarios = db.collection("usuarios");
    logger.info(`Conectado correctamente a la base de datos ${db.databaseName}`);
  } catch (error) {
    logger.error(error, "Error conectando a la base de datos");
    throw new ErrorConexionBD((error as Error).message);
  }
}

/**
 * Algo como un typeguard para que la coleccion nunca sea undefined y no debamos usar
 * el ? para acceder a ellas
 */
export function getColeccion<T extends Document>(coleccion: mongoDB.Collection<T> | undefined) {
  if (!coleccion) throw new Error("Colección no inicializada");
  return coleccion;
}

export async function desconectarBD() {
  await cliente.close();
}
