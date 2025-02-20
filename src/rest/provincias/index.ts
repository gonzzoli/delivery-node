import { Request, Response, Router } from "express";
import { tryCatchControlador } from "../../errores/tryCatch";
import { coleccionesMongo, getColeccion } from "../../config/bd";

const router = Router();

const buscarProvincias = async (_req: Request, res: Response) => {
  const provincias = await getColeccion(coleccionesMongo.provincias).find().toArray();
  res.status(200).send(provincias);
};

router.get("", tryCatchControlador(buscarProvincias));

export default router;
