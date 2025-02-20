import { Router } from "express";
import routerEnvios from "../rest/envios";
import routerProvincias from "../rest/provincias";
import routerArticulos from "../rest/articulos";

const router = Router();

router.use("/envios", routerEnvios);
router.use("/provincias", routerProvincias);
router.use("/articulos", routerArticulos);

export default router;
