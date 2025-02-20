import { ObjectId, WithId } from "mongodb";
import { CalcularEnvioDTO } from "../../../rest/envios/dto";
import { Articulo } from "../schema";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { ErrorRecursoNoEncontrado } from "../../../errores/clasesErrores";
import turf from "@turf/turf";
import { ResCalcularEnvio } from "../../../rest/envios/respuestas";

export const calcularEnvio = async (especificacionEnvio: CalcularEnvioDTO) => {
  // Se buscan todos los articulos solicitados. Si alguno no está en la BD entonces no tenemos sus dimensiones,
  // por lo que no podemos calcular su espacio y peso, y por ende tampoco su precio. Lanzamos un error en ese caso
  const articulosBD = new Map<string, WithId<Articulo>>(
    (
      await Promise.all(
        especificacionEnvio.articulos.map(async (articulo) => {
          const articuloEncontrado = await getColeccion(coleccionesMongo.articulos).findOne({
            _id: new ObjectId(articulo.articuloId),
          });

          if (articuloEncontrado) return articuloEncontrado;
          throw new ErrorRecursoNoEncontrado(
            "No se encontró al articulo con id: " + articulo.articuloId
          );
        })
      )
    ).map((art) => [art._id.toHexString(), art])
  );

  const [precioPorKm, precioPorM2, precioPorKg] = await Promise.all([
    coleccionesMongo.parametros?.findOne({ nombre: "precio_por_km" }),
    coleccionesMongo.parametros?.findOne({ nombre: "precio_por_m2" }),
    coleccionesMongo.parametros?.findOne({ nombre: "precio_por_kg" }),
  ]);

  // Distancia en linea recta, no usando rutas/calles
  const distanciaOrigenDestinoKm = turf.distance(
    especificacionEnvio.origenEnvio,
    especificacionEnvio.destinoEnvio
  );

  const preciosPorArticulo = especificacionEnvio.articulos.map<
    ResCalcularEnvio["preciosPorArticulo"][number]
  >((articuloPedido) => {
    const articuloBD = articulosBD.get(articuloPedido.articuloId)!;
    // Formula no muy convincente, pero solo para que interactuen las distintas variables del articulo y el envio
    const precioPorUnidad =
      distanciaOrigenDestinoKm * precioPorKm!.valor +
      articuloBD.peso * precioPorKg!.valor +
      articuloBD.ancho * articuloBD.largo * precioPorM2!.valor;
    return {
      articuloId: articuloBD._id.toHexString(),
      nombre: articuloBD.nombre,
      cantidad: articuloPedido.cantidad,
      // Solo la primera unidad se cobra completa, el resto al 50% para simular descuento de por mayor
      precioCalculadoEnvio: precioPorUnidad + (articuloPedido.cantidad - 1) * precioPorUnidad * 0.5,
    };
  });

  return {
    distancia: distanciaOrigenDestinoKm,
    duracionEstimadaMins: (distanciaOrigenDestinoKm / 80) * 60, // Velocidad estimada de 80km/h
    precioTotal: preciosPorArticulo.reduce(
      (precioResultante, articulo) => precioResultante + articulo.precioCalculadoEnvio,
      0
    ),
    preciosPorArticulo,
  };
};
