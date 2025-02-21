import { ObjectId } from "mongodb";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { Envio, ESTADOS_ENVIO, Punto } from "../schema";
import {
  ErrorEntidadAccionInvalida,
  ErrorRecursoNoEncontrado,
} from "../../../errores/clasesErrores";
import { EventoEnvio, evolucionarEnvio } from "../eventos";

export const actualizarUbicacionEnvio = async (
  envioId: Envio["envioId"],
  nuevaUbicacion: Punto
) => {
  const envio = await getColeccion(coleccionesMongo.envios).findOne({
    _id: new ObjectId(envioId),
  });

  if (!envio) throw new ErrorRecursoNoEncontrado("No se ha encontrado el envio");
  if (envio.estado !== ESTADOS_ENVIO.EN_CAMINO)
    throw new ErrorEntidadAccionInvalida(
      "El estado del envio es " +
        envio.estado +
        ". Solo puedes actualizar la ubicación de un envio que se encuentra en camino."
    );

  const eventoUbicacionActualizada: EventoEnvio & {
    nombreEvento: "EnvioUbicacionActualizada";
  } = {
    agregadoId: envio._id.toHexString() as Envio["envioId"],
    fyhEvento: new Date(),
    secuenciaEvento: ,
    nombreEvento: "EnvioUbicacionActualizada",
    contenido: { fyhUbicacion: new Date(), ubicacion: nuevaUbicacion },
  };
  const agregadoEvolucionado = evolucionarEnvio([eventoUbicacionActualizada], envio);
};
