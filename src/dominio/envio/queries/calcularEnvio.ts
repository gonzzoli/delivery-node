import { ObjectId, WithId } from "mongodb";
import { Articulo } from "../schema";
import { coleccionesMongo, getColeccion } from "../../../config/bd";
import { ErrorEnvioNoPosible, ErrorRecursoNoEncontrado } from "../../../errores/clasesErrores";
import turf from "@turf/turf";
import { ResCalcularEnvio } from "../../../rest/envios/respuestas";
import { Point } from "geojson";

type CalcularEnvioParams = {
  origenEnvio: Point;
  destinoEnvio: Point;
  articulos: {
    articuloId: string;
    cantidad: number;
  }[];
};
export const calcularEnvio = async (especificacionEnvio: CalcularEnvioParams) => {
  // Se buscan todos los articulos solicitados. Si alguno no está en la BD entonces no tenemos sus dimensiones,
  // por lo que no podemos calcular su espacio y peso, y por ende tampoco su precio. Lanzamos un error en ese caso
  const articulosIds = especificacionEnvio.articulos.map(
    (articulo) => new ObjectId(articulo.articuloId)
  );
  const articulosBD = await getColeccion(coleccionesMongo.articulos)
    .find({
      _id: {
        $in: articulosIds,
      },
    })
    .toArray();
  const articulosMap = new Map<string, WithId<Articulo>>(
    articulosBD.map((art) => [art._id.toHexString(), art])
  );

  const articulosNoEncontradosIds = articulosIds
    .map((id) => id.toHexString())
    .filter((id) => !articulosMap.has(id));

  if (articulosNoEncontradosIds.length > 0)
    throw new ErrorRecursoNoEncontrado(
      "No se encontraron articulos con los siguientes ids: " + articulosNoEncontradosIds.join(", ")
    );

  const [precioPorKm, precioPorM2, precioPorKg, provinciaOrigen, provinciaDestino] =
    await Promise.all([
      coleccionesMongo.parametros?.findOne({ nombre: "precio_por_km" }),
      coleccionesMongo.parametros?.findOne({ nombre: "precio_por_m2" }),
      coleccionesMongo.parametros?.findOne({ nombre: "precio_por_kg" }),
      coleccionesMongo.provincias?.findOne({
        poligonoLimite: { $geoIntersects: { $geometry: especificacionEnvio.origenEnvio } },
      }),
      coleccionesMongo.provincias?.findOne({
        poligonoLimite: { $geoIntersects: { $geometry: especificacionEnvio.destinoEnvio } },
      }),
    ]);

  // Si no encontró la provincia, es porque esta fuera de Argentina, y el negocio
  // no acepta envios internacionales
  if (!provinciaOrigen || !provinciaDestino) {
    throw new ErrorEnvioNoPosible(
      `El ${!provinciaOrigen ? "origen" : "destino"} no está dentro del país. 
      El negocio no realiza envios internacionales`
    );
  }

  // Distancia en linea recta, no usando rutas/calles
  const distanciaOrigenDestinoKm = turf.distance(
    especificacionEnvio.origenEnvio,
    especificacionEnvio.destinoEnvio
  );

  const detallePorArticulo = especificacionEnvio.articulos.map<
    ResCalcularEnvio["preciosPorArticulo"][number]
  >((articuloPedido) => {
    const articuloBD = articulosMap.get(articuloPedido.articuloId)!;
    // Formula no muy convincente, pero solo para que interactuen las distintas variables del articulo y el envio
    const precioPorUnidad =
      distanciaOrigenDestinoKm * precioPorKm!.valor +
      articuloBD.peso * precioPorKg!.valor +
      articuloBD.ancho * articuloBD.largo * precioPorM2!.valor;
    return {
      articuloId: articuloBD._id.toHexString(),
      nombre: articuloBD.nombre,
      cantidad: articuloPedido.cantidad,
      peso: articuloBD.peso,
      largo: articuloBD.largo,
      ancho: articuloBD.ancho,
      pesoTotalArticulos: articuloBD.peso * articuloPedido.cantidad,
      // Solo la primera unidad se cobra completa, el resto al 50% para simular descuento de por mayor
      precioCalculadoArticulos:
        precioPorUnidad + (articuloPedido.cantidad - 1) * precioPorUnidad * 0.5,
    };
  });

  return {
    distancia: distanciaOrigenDestinoKm,
    duracionEstimadaMins: calcularDuracionEstimadaViajeMins(distanciaOrigenDestinoKm),
    pesoTotalEnvio: detallePorArticulo.reduce(
      (pesoResultante, articulo) => pesoResultante + articulo.pesoTotalArticulos,
      0
    ),
    precioTotal:
      detallePorArticulo.reduce(
        (precioResultante, articulo) => precioResultante + articulo.precioCalculadoArticulos,
        0
        // Si tiene que atravesar provincias el envío, se duplica el precio total (regla de negocio)
      ) * (provinciaOrigen._id.equals(provinciaDestino._id) ? 1 : 2),
    detallePorArticulo,
  };
};

/**
 * Velocidad estimada de 80km/h
 */
export const calcularDuracionEstimadaViajeMins = (distanciaKm: number) => (distanciaKm / 80) * 60;
