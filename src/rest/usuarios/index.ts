import { Request, Response, Router } from "express";
import { tryCatchControlador } from "../../errores/tryCatch";
import { validarRequest } from "../../middlewares/validarRequest";
import z from "zod";
import { ExtraerRestDTO, schemaPuntoGeoJSONDTO, stringZod } from "../../utils/zodUtils";
import ComandosUsuario from "../../dominio/usuario/comandos";
import { ErrorAutorizacion } from "../../errores/clasesErrores";
import { CodigosHTTP } from "../../utils/codigosHTTP";
import { validarUsuario } from "../../middlewares/validarUsuario";

const router = Router();

const schemaActualizarUsuarioDTO = z.object({
  params: z.object({ usuarioId: stringZod("id del usuario") }),
  body: z.object({
    ubicacion: schemaPuntoGeoJSONDTO,
  }),
});
export type ActualizarUsuarioDTO = ExtraerRestDTO<typeof schemaActualizarUsuarioDTO>;

// Solo actualiza la direccion del usuario.
const actualizarUsuario = async (req: Request, res: Response) => {
  const dto = req.datosValidados as ActualizarUsuarioDTO;
  if (req.usuario!.permisos.includes("admin") && dto.usuarioId !== req.usuario!._id.toString())
    throw new ErrorAutorizacion();
  const usuarioActualizado = await ComandosUsuario.actualizarUsuario({
    usuarioId: dto.usuarioId,
    ubicacion: dto.ubicacion,
  });
  res.status(CodigosHTTP.OK).send(usuarioActualizado);
};

router.patch(
  "/:usuarioId",
  validarUsuario,
  validarRequest(schemaActualizarUsuarioDTO),
  tryCatchControlador(actualizarUsuario)
);

export default router;
