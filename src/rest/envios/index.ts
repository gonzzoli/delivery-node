import { Router } from "express";
import { tryCatchControlador } from "../../errores/tryCatch";
import { validarRequest } from "../../middlewares/midValidarRequest";
import { schemaActualizarUbicacionEnvioDTO } from "./dto";
import { buscarEnvios } from "./controladores/buscarEnvios";
import { buscarEnvio } from "./controladores/buscarEnvio";
import { calcularEnvio } from "./controladores/calcularEnvio";
import { actualizarUbicacionEnvio } from "./controladores/actualizarUbicacionEnvio";

const router = Router();

router.get("", tryCatchControlador(buscarEnvios));
router.get("/:envioId", tryCatchControlador(buscarEnvio));

router.post("/calcular", tryCatchControlador(calcularEnvio));
router.post(
  "/:envioId/ubicacion",
  validarRequest(schemaActualizarUbicacionEnvioDTO),
  tryCatchControlador(actualizarUbicacionEnvio)
);
router.post("/:envioId/entrega", tryCatchControlador());
router.post("", tryCatchControlador());

export default router;
