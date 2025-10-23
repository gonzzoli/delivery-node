import { ObjectId } from "mongodb";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { decode } from "jsonwebtoken";
import { type PayloadToken } from "../../../middlewares/validarUsuario";

export const invalidarToken = async (tokenJWT: string) => {
  const { tokenID } = decode(tokenJWT) as PayloadToken;
  const tokenExistente = await getColeccion(coleccionesMongo.tokens).findOne({
    _id: new ObjectId(tokenID),
  });
  if (!tokenExistente) throw new Error("No se pudo encontrar el token con id: " + tokenID);
  // Simplemente ponemos enabled en false. Ese campo se valida en el middleware de validarUsuario asi que es suficiente para que no lo autorice
  await getColeccion(coleccionesMongo.tokens).updateOne(
    { _id: new ObjectId(tokenID) },
    { $set: { enabled: false } }
  );
};
