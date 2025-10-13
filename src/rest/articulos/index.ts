import { Router } from "express";
import { modificarArticulo } from "./controladores/modificarArticulo";
import { validarRequest } from "../../middlewares/validarRequest";
import { schemaModificarArticuloDTO } from "./dto";
import { validarUsuario } from "../../middlewares/validarUsuario";
import { tryCatchControlador } from "../../errores/tryCatch";

const router = Router();

router.patch(
  "/:articuloId",
  validarUsuario,
  validarRequest(schemaModificarArticuloDTO),
  tryCatchControlador(modificarArticulo)
);

export default router;
