import { Router } from "express";
import routerEnvios from "../rest/envios";
import routerProvincias from "../rest/provincias";
import routerArticulos from "../rest/articulos";
import routerUsuarios from "../rest/usuarios";

const router = Router();

router.use("/envios", routerEnvios);
router.use("/provincias", routerProvincias);
router.use("/articulos", routerArticulos);
router.use("/usuarios", routerUsuarios);

export default router;
