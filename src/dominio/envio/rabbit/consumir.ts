import { fabricaConsumirMensajeExchangeRabbit, TIPOS_EXCHANGE } from "../../../config/rabbit";
import { OrderPlacedData, crearEnvioDesdeOrden } from "../comandos/crearEnvioDesdeOrden";

void fabricaConsumirMensajeExchangeRabbit<OrderPlacedData>(
  "order_placed",
  TIPOS_EXCHANGE.FANOUT,
  { durable: false },
  "",
  // Si no tuviese que enviar ack en rabbit no haria falta que esto sea async await
  async (mensaje) => {
    await crearEnvioDesdeOrden(mensaje);
  }
);
