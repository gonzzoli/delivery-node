import { ObjectId } from "mongodb";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { Point } from "geojson";
import { ErrorRecursoNoEncontrado } from "../../../errores/clasesErrores";

export type ComandoActualizarUsuario = {
  usuarioId: string;
  ubicacion: Point;
};

export const actualizarUsuario = async (comando: ComandoActualizarUsuario) => {
  const provinciaCorrespondiente = await getColeccion(coleccionesMongo.provincias).findOne({
    poligonoLimite: {
      $geoIntersects: {
        $geometry: comando.ubicacion,
      },
    },
  });

  if (!provinciaCorrespondiente)
    throw new ErrorRecursoNoEncontrado("El servicio solo esta disponible dentro de Argentina.");

  const usuarioActualizado = await getColeccion(coleccionesMongo.usuarios).findOneAndUpdate(
    {
      _id: new ObjectId(comando.usuarioId),
    },
    { $set: { coordenadas: comando.ubicacion, provincia: provinciaCorrespondiente.nombre } },
    { returnDocument: "after" }
  );

  return usuarioActualizado;
};
