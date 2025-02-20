import { ObjectId } from "mongodb";
import { fabricaConsumirMensajeExchangeRabbit, TIPOS_EXCHANGE } from ".";
import { coleccionesMongo, getColeccion } from "../config/bd";
import { ErrorRecursoNoEncontrado } from "../errores/clasesErrores";

// Tengo que encontrar los eventos en los otros microservicios, o ver documentacion si es q hay
export type OrderPlacedData = {
  orderId: string;
  cartId: string;
  userId: number;
  articles: { articleId: string; quantity: number }[];
};
fabricaConsumirMensajeExchangeRabbit<OrderPlacedData>(
  "order_placed",
  TIPOS_EXCHANGE.FANOUT,
  "",
  async (mensaje) => {
    const articulosIds = mensaje.articles.map((a) => new ObjectId(a.articleId));
    const articulosOrden = await getColeccion(coleccionesMongo.articulos)
      .find({ _id: { $in: articulosIds } })
      .toArray();

    if (articulosOrden.length !== articulosIds.length) {
      throw new ErrorRecursoNoEncontrado(
        "No disponemos de las dimensiones/peso de alguno de los articulos. No es posible generar el envío."
      );
    }
  }
);
