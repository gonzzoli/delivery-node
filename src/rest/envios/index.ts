import { Router } from "express";
import { tryCatchControlador } from "../../errores/tryCatch";
import { validarRequest } from "../../middlewares/validarRequest";
import {
  schemaActualizarUbicacionEnvioDTO,
  schemaCalcularEnvioDTO,
  schemaEntregarEnvioDTO,
} from "./dto";
import { buscarEnvios } from "./controladores/buscarEnvios";
import { buscarEnvio } from "./controladores/buscarEnvio";
import { calcularEnvio } from "./controladores/calcularEnvio";
import { actualizarUbicacionEnvio } from "./controladores/actualizarUbicacionEnvio";
import { despacharEnvio } from "./controladores/despacharEnvio";
import { entregarEnvio } from "./controladores/entregarEnvio";
import { paramsZod, stringZod } from "../../utils/zodUtils";
import { validarUsuario } from "../../middlewares/validarUsuario";

const router = Router();

router.get("", tryCatchControlador(buscarEnvios));
router.post(
  "/calcular",
  validarRequest(schemaCalcularEnvioDTO),
  tryCatchControlador(calcularEnvio)
);
router.post(
  "/:envioId/ubicacion",
  validarUsuario("admin"),
  validarRequest(schemaActualizarUbicacionEnvioDTO),
  tryCatchControlador(actualizarUbicacionEnvio)
);
router.post(
  "/:envioId/despachar",
  validarUsuario("admin"),
  validarRequest(paramsZod({ envioId: stringZod("id del envio") })),
  tryCatchControlador(despacharEnvio)
);
router.post(
  "/:envioId/entregar",
  validarUsuario("admin"),
  validarRequest(schemaEntregarEnvioDTO),
  tryCatchControlador(entregarEnvio)
);
router.get("/:envioId", validarUsuario, tryCatchControlador(buscarEnvio));

export default router;
