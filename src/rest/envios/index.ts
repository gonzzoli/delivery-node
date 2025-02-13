import { Router } from "express";
import { tryCatchControlador } from "../../errores/tryCatch";
import { validarRequest } from "../../middlewares/midValidarRequest";
import { schemaActualizarUbicacionEnvioDTO } from "./dto";

const router = Router();

router.get("", tryCatchControlador());
router.get("/:envioId", tryCatchControlador());

router.post("/calcular", tryCatchControlador());
router.post(
  "/:envioId/ubicacion",
  validarRequest(schemaActualizarUbicacionEnvioDTO),
  tryCatchControlador()
);
router.post("/:envioId/entrega", tryCatchControlador());
router.post("", tryCatchControlador());

export default router;
