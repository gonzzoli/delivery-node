import { Router } from "express";
import { tryCatchControlador } from "../errores/tryCatch";

const router = Router();

router.use("/envios", routerEnvios);
router.use("/usuarios", routerUsuarios);

router.get("/provincias", routerProvincias);

export default router;
