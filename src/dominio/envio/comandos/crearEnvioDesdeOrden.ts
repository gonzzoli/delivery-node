import { ObjectId } from "mongodb";
import { getColeccion, coleccionesMongo } from "../../../config/bd";
import type { EventoEnvio } from "../eventos";
import QueriesEnvio from "../queries";
import { CarritoId, OrdenId } from "../schema";
import { Point } from "geojson";
import { emitirEnvioCreado } from "../rabbit/emitir";
import { MensajeRabbit } from "../../../config/rabbit";

export type OrderPlacedData = {
  orderId: OrdenId;
  cartId: CarritoId;
  userId: string;
  originAddress: Point;
  destinationAddress: Point;
  articles: { articleId: string; quantity: number }[];
};

export const crearEnvioDesdeOrden = async ({ message: orden }: MensajeRabbit<OrderPlacedData>) => {
  console.log("ORDEN PUESTA", orden);
  const envioCalculado = await QueriesEnvio.calcularEnvio({
    origenEnvio: orden.originAddress,
    destinoEnvio: orden.destinationAddress,
    articulos: orden.articles.map((a) => ({
      articuloId: a.articleId,
      cantidad: a.quantity,
    })),
  });

  const nuevoEnvioId = new ObjectId();
  const eventoEnvioCreado: EventoEnvio & { nombreEvento: "EnvioCreado" } = {
    nombreEvento: "EnvioCreado",
    agregadoId: nuevoEnvioId.toHexString(),
    fyhEvento: new Date(),
    secuenciaEvento: 1, // Siempre sera el primer evento
    contenido: {
      fyhAlta: new Date(),
      estado: "PENDIENTE DE DESPACHO",
      _id: nuevoEnvioId.toHexString(),
      origen: orden.originAddress,
      destino: orden.destinationAddress,
      costo: envioCalculado.precioTotal,
      duracionEstimadaViajeMins: envioCalculado.duracionEstimadaMins,
      distanciaTotalKm: envioCalculado.distanciaKm,
      ordenId: orden.orderId,
      usuarioCompradorId: orden.userId,
      especificacion: envioCalculado.detallePorArticulo.map((art) => ({
        articuloId: art.articuloId,
        cantidad: art.cantidad,
        pesoTotalArticulosKg: art.pesoTotalArticulosKg,
        precioCalculadoArticulos: art.precioCalculadoArticulos,
        nombre: art.nombre,
        anchoM: art.anchoM,
        largoM: art.largoM,
        pesoKg: art.pesoKg,
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
