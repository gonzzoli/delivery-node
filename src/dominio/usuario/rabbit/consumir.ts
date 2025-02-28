import { fabricaConsumirMensajeExchangeRabbit, TIPOS_EXCHANGE } from "../../../config/rabbit";
import { registrarUsuario } from "../comandos";
import { Usuario } from "../schema";

void fabricaConsumirMensajeExchangeRabbit<Usuario>(
  "user_registered",
  TIPOS_EXCHANGE.FANOUT,
  "delivery_user_registered",
  "",
  { durable: true },
  async (mensaje) => {
    await registrarUsuario(mensaje);
  }
);
