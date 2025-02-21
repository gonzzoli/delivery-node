import { fabricaConsumirMensajeExchangeRabbit, TIPOS_EXCHANGE } from ".";
import {
  crearEnvioDesdeOrden,
  OrderPlacedData,
} from "../dominio/envio/comandos/crearEnvioDesdeOrden";

fabricaConsumirMensajeExchangeRabbit<OrderPlacedData>(
  "order_placed",
  TIPOS_EXCHANGE.FANOUT,
  "",
  // Si no tuviese que enviar ack en rabbit no haria falta que esto sea async await
  async (mensaje) => {
    await crearEnvioDesdeOrden(mensaje);
  }
);
