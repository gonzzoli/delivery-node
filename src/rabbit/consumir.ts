import { fabricaConsumirMensajeExchangeRabbit, TIPOS_EXCHANGE } from ".";

// Tengo que encontrar los eventos en los otros microservicios, o ver documentacion si es q hay
type OrderPlacedData = {
  orderId: string;
  cartId: string;
  userId: number;
  articles: { articleId: number; quantity };
};
fabricaConsumirMensajeExchangeRabbit(
  "order_placed",
  TIPOS_EXCHANGE.FANOUT,
  "",
  (mensaje: OrderPlacedData  ) => {}
);
