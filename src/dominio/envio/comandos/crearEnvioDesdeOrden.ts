import { ObjectId } from "mongodb";
import { getColeccion, coleccionesMongo } from "../../../config/bd";
import { ErrorRecursoNoEncontrado } from "../../../errores/clasesErrores";
import { Usuario } from "../../usuario/schema";
import type { EventoEnvio } from "../eventos";
import QueriesEnvio from "../queries";
import { CarritoId, OrdenId } from "../schema";
import { Point } from "geojson";
import { emitirEnvioCreado } from "../rabbit/emitir";

export type OrderPlacedData = {
  orderId: OrdenId;
  cartId: CarritoId;
  userId: Usuario["usuarioId"];
  originAddress: Point;
  destinationAddress: Point;
  articles: { articleId: string; quantity: number }[];
};
export const crearEnvioDesdeOrden = async (orden: OrderPlacedData) => {
  const articulosIds = orden.articles.map((a) => new ObjectId(a.articleId));
  const articulosOrden = await getColeccion(coleccionesMongo.articulos)
    .find({ _id: { $in: articulosIds } })
    .toArray();

  if (articulosOrden.length !== articulosIds.length) {
    throw new ErrorRecursoNoEncontrado(
      "No disponemos de las dimensiones/peso de alguno de los articulos. No es posible generar el envío."
    );
  }

  const envioCalculado = await QueriesEnvio.calcularEnvio({
    origenEnvio: orden.originAddress,
    destinoEnvio: orden.destinationAddress,
    articulos: orden.articles.map((a) => ({
      articuloId: a.articleId,
      cantidad: a.quantity,
    })),
  });
  const nuevoEnvioId = new ObjectId();
  const eventoEnvioCreado: EventoEnvio = {
    nombreEvento: "EnvioCreado",
    agregadoId: nuevoEnvioId.toHexString(),
    fyhEvento: new Date(),
    secuenciaEvento: 1,
    contenido: {
      fyhAlta: new Date(),
      estado: "PENDIENTE DE DESPACHO",
      _id: nuevoEnvioId.toHexString(),
      origen: orden.originAddress,
      destino: orden.destinationAddress,
      costo: envioCalculado.precioTotal,
      codigoEntrega: Math.random().toString().slice(2, 7),
      duracionEstimadaViajeMins: envioCalculado.duracionEstimadaMins,
      distanciaTotal: envioCalculado.distancia,
      ordenId: orden.orderId,
      usuarioCompradorId: orden.userId,
      especificacion: envioCalculado.detallePorArticulo.map((art) => ({
        articuloId: art.articuloId,
        cantidad: art.cantidad,
        pesoTotalArticulos: art.pesoTotalArticulos,
        precioCalculadoArticulos: art.precioCalculadoArticulos,
        nombre: art.nombre,
        ancho: art.ancho,
        largo: art.largo,
        peso: art.peso,
      })),
    },
  };

  await getColeccion(coleccionesMongo.eventosEnvios).insertOne(eventoEnvioCreado);
  // Esta vez simplemente guardamos el contenido del evento porque es el primero, pero en otros eventos
  // se debe aplicar el evento a la proyeccion anterior, y luego guardar la proyección actualizada
  void getColeccion(coleccionesMongo.envios).insertOne({
    ...eventoEnvioCreado.contenido,
    _id: nuevoEnvioId,
  });

  // y emitimos el evento
  void emitirEnvioCreado(eventoEnvioCreado.contenido);
};
