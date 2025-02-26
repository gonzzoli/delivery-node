import { fabricaConsumirMensajeExchangeRabbit, TIPOS_EXCHANGE } from "../../../config/rabbit";
import { OrderPlacedData, crearEnvioDesdeOrden } from "../../envio/comandos/crearEnvioDesdeOrden";

void fabricaConsumirMensajeExchangeRabbit<OrderPlacedData>(
  "user_registered",
  TIPOS_EXCHANGE.FANOUT,
  { durable: true },
  "",
  async (mensaje) => {
    await crearEnvioDesdeOrden(mensaje);
  }
);
