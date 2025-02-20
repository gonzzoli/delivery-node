import { Request, Response } from "express";
import { CodigosHTTP } from "../../../utils/codigosHTTP";
import { RegistrarArticuloDTO } from "../dto";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { Articulo } from "../../../dominio/envio/schema";
import axios from "axios";
import { ErrorRecursoNoEncontrado } from "../../../errores/clasesErrores";
import { ObjectId } from "mongodb";

export const registrarArticulo = async (req: Request, res: Response) => {
  const dto = req.datosValidados as RegistrarArticuloDTO;

  const articuloExistente = await coleccionesMongo.articulos?.findOne({
    _id: new ObjectId(dto.articuloId),
  });

  let articuloActualizado: Articulo;
  if (!articuloExistente) articuloActualizado = await buscarYGuardarArticuloCatalog(dto);
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

type CatalogResBuscarArticuloPorId = {
  _id: ObjectId;
  name: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  enabled: boolean;
};
const buscarYGuardarArticuloCatalog = async (articuloDTO: RegistrarArticuloDTO) => {
  const { data: articuloCatalog } = await axios.get<CatalogResBuscarArticuloPorId>(
    `${process.env.CATALOG_API_BASE_URL}/articles/${articuloDTO.articuloId}`
  );
  if (!articuloCatalog)
    throw new ErrorRecursoNoEncontrado(
      "No se encontró el articulo con id: " + articuloDTO.articuloId
    );

  const { insertedId } = await getColeccion(coleccionesMongo.articulos).insertOne({
    _id: articuloCatalog._id,
    nombre: articuloCatalog.name,
    peso: articuloDTO.peso,
    largo: articuloDTO.largo,
    ancho: articuloDTO.ancho,
  });

  const articuloInsertado = await getColeccion(coleccionesMongo.articulos).findOne({
    _id: insertedId,
  });

  return articuloInsertado!;
};
