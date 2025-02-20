import { ObjectId } from "mongodb";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { Envio, Punto } from "../schema";
import {
  ErrorEntidadAccionInvalida,
  ErrorRecursoNoEncontrado,
} from "../../../errores/clasesErrores";

export const actualizarUbicacionEnvio = async (
  envioId: Envio["envioId"],
  nuevaUbicacion: Punto
) => {
  const envio = await getColeccion(coleccionesMongo.envios).findOne({
    _id: new ObjectId(envioId),
  });

  if (!envio) throw new ErrorRecursoNoEncontrado("No se ha encontrado el envio");
  if (envio.estado !== "EN CAMINO")
    throw new ErrorEntidadAccionInvalida(
      "El estado del envio es " +
        envio.estado +
        ". Solo puedes actualizar la ubicación de un envio que se encuentra en camino."
    );

    
};
