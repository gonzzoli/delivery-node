import { Router } from "express";
import { tryCatchControlador } from "../errores/tryCatch";

const router = Router();

router.use("/envios", routerEnvios);
router.use("/usuarios", routerUsuarios);

router.get("/provincias", tryCatchControlador());

export default router;
