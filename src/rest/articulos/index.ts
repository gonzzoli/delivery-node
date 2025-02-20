import { Router } from "express";
import { registrarArticulo } from "./controladores/registrarArticulo";
import { validarRequest } from "../../middlewares/midValidarRequest";
import { schemaRegistrarArticuloDTO } from "./dto";

const router = Router();

router.post("/:articuloId", validarRequest(schemaRegistrarArticuloDTO), registrarArticulo);

export default router;
