import { Request, Response } from "express";
import { CodigosHTTP } from "../../../utils/codigosHTTP";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { Articulo } from "../../../dominio/envio/schema";
import axios from "axios";
import { ErrorRecursoNoEncontrado } from "../../../errores/clasesErrores";
import { ObjectId } from "mongodb";
import { ModificarArticuloDTO } from "../dto";

export const modificarArticulo = async (req: Request, res: Response) => {
  const dto = req.datosValidados as ModificarArticuloDTO;

  const articuloExistente = await coleccionesMongo.articulos?.findOne({
    _id: new ObjectId(dto.articuloId),
  });

  let articuloActualizado: Articulo;
  if (!articuloExistente)
    articuloActualizado = await buscarYGuardarArticuloCatalog(dto, req.headers.authorization!);
  else
    articuloActualizado = (await getColeccion(coleccionesMongo.articulos).findOneAndUpdate(
      {
        _id: articuloExistente._id,
      },
      { $set: { peso: dto.peso, largo: dto.largo, ancho: dto.ancho } },
      { returnDocument: "after" }
    ))!;

  res.status(CodigosHTTP.ACCEPTED).send(articuloActualizado);
};

type ResCatalogBuscarArticuloPorId = {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  enabled: boolean;
};
const buscarYGuardarArticuloCatalog = async (dto: ModificarArticuloDTO, tokenJWT: string) => {
  const { data: articuloCatalog } = await axios.get<ResCatalogBuscarArticuloPorId>(
    `${process.env.CATALOG_API_BASE_URL}/articles/${dto.articuloId}`,
    {
      headers: {
        Authorization: tokenJWT,
      },
    }
  );
  if (!articuloCatalog)
    throw new ErrorRecursoNoEncontrado("No se encontró el articulo con id: " + dto.articuloId);

  const { insertedId } = await getColeccion(coleccionesMongo.articulos).insertOne({
    _id: new ObjectId(articuloCatalog._id),
    nombre: articuloCatalog.name,
    peso: dto.peso,
    largo: dto.largo,
    ancho: dto.ancho,
  });

  const articuloInsertado = await getColeccion(coleccionesMongo.articulos).findOne({
    _id: insertedId,
  });

  return articuloInsertado!;
};
