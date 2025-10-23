import { Router } from "express";
import { modificarArticulo } from "./controladores/modificarArticulo";
import { validarRequest } from "../../middlewares/validarRequest";
import { schemaModificarArticuloDTO } from "./dto";
import { tryCatchControlador } from "../../errores/tryCatch";
import { validarUsuario } from "../../middlewares/validarUsuario";

const router = Router();

router.patch(
  "/:articuloId",
  validarUsuario("admin"),
  validarRequest(schemaModificarArticuloDTO),
  tryCatchControlador(modificarArticulo)
);

export default router;
