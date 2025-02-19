import { Request, Response } from "express";
import { CalcularEnvioDTO } from "../dto";
import { CodigosHTTP } from "../../../utils/codigosHTTP";
import { coleccionesMongo } from "../../../config/bd";
import { Articulo } from "../../../dominio/envio/schema";
import { ErrorRecursoNoEncontrado } from "../../../errores/clasesErrores";
import { ResCalcularEnvio } from "../respuestas";
import turf from "@turf/turf";

export const calcularEnvio = async (req: Request, res: Response) => {
  const dto = req.datosValidados as CalcularEnvioDTO;

  // Se buscan todos los articulos solicitados. Si alguno no está en la BD entonces no tenemos sus dimensiones,
  // por lo que no podemos calcular su espacio y peso, y por ende tampoco su precio. Lanzamos un error en ese caso
  const articulosBD = new Map<string, Articulo>(
    (
      await Promise.all(
        dto.articulos.map(async (articulo) => {
          const articuloEncontrado = await coleccionesMongo.articulos?.findOne({
            articuloId: articulo.articuloId as Articulo["articuloId"],
          });

          if (articuloEncontrado) return articuloEncontrado;
          throw new ErrorRecursoNoEncontrado(
            "No se encontró al articulo con id: " + articulo.articuloId
          );
        })
      )
    ).map((art) => [art.articuloId, art])
  );

  const [precioPorKm, precioPorM2, precioPorKg] = await Promise.all([
    coleccionesMongo.parametros?.findOne({ nombre: "precio_por_km" }),
    coleccionesMongo.parametros?.findOne({ nombre: "precio_por_m2" }),
    coleccionesMongo.parametros?.findOne({ nombre: "precio_por_kg" }),
  ]);

  // Distancia en linea recta, no usando rutas/calles
  const distanciaOrigenDestinoKm = turf.distance(dto.origenEnvio, dto.destinoEnvio);

  const preciosPorArticulo = dto.articulos.map<ResCalcularEnvio["preciosPorArticulo"][number]>(
    (articuloPedido) => {
      const articuloBD = articulosBD.get(articuloPedido.articuloId)!;
      // Formula no muy convincente, pero solo para que interactuen las distintas variables del articulo y el envio
      const precioPorUnidad =
        distanciaOrigenDestinoKm * precioPorKm!.valor +
        articuloBD.peso * precioPorKg!.valor +
        articuloBD.ancho * articuloBD.largo * precioPorM2!.valor;
      return {
        articuloId: articuloBD.articuloId,
        nombre: articuloBD.nombre,
        cantidad: articuloPedido.cantidad,
        // Solo la primera unidad se cobra completa, el resto al 50% para simular descuento de por mayor
        precioCalculadoEnvio:
          precioPorUnidad + (articuloPedido.cantidad - 1) * precioPorUnidad * 0.5,
      };
    }
  );

  res.status(CodigosHTTP.ACCEPTED).send({
    distancia: distanciaOrigenDestinoKm,
    duracionEstimadaMins: (distanciaOrigenDestinoKm / 80) * 60, // Velocidad estimada de 80km/h
    precioTotal: preciosPorArticulo.reduce(
      (precioResultante, articulo) => precioResultante + articulo.precioCalculadoEnvio,
      0
    ),
    preciosPorArticulo,
  } as ResCalcularEnvio);
};
