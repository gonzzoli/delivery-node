import { MongoClient, Document, Collection } from "mongodb";
import { logger } from "../utils/logger";
import { ErrorConexionBD } from "../errores/clasesErrores";
import type { Articulo, Envio, Parametro, Provincia } from "../dominio/envio/schema";
import type { EventoEnvio } from "../dominio/envio/eventos";
import type { Usuario } from "../dominio/usuario/schema";

type ColeccionesBD = {
  envios?: Collection<Envio>;
  eventosEnvios?: Collection<EventoEnvio>;
  articulos?: Collection<Articulo>;
  usuarios?: Collection<Usuario>;
  provincias?: Collection<Provincia>;
  parametros?: Collection<Parametro>;
};

export const coleccionesMongo: ColeccionesBD = {};
export const cliente = new MongoClient(process.env.MONGO_CONN_STRING);

export async function conectarBD() {
  try {
    await cliente.connect();
    const db = cliente.db(process.env.MONGO_DB_NAME);
    coleccionesMongo.envios = db.collection("envios");
    coleccionesMongo.eventosEnvios = db.collection("eventosEnvios");
    coleccionesMongo.usuarios = db.collection("usuarios");
    coleccionesMongo.articulos = db.collection("articulos");
    coleccionesMongo.provincias = db.collection("provincias");
    coleccionesMongo.parametros = db.collection("parametros");
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
export function getColeccion<T extends Document>(coleccion: Collection<T> | undefined) {
  if (!coleccion) throw new Error("Colección no inicializada");
  return coleccion;
}

export async function desconectarBD() {
  await cliente.close();
}
