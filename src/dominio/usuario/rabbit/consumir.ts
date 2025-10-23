import { fabricaConsumirMensajeExchangeRabbit, TIPOS_EXCHANGE } from "../../../config/rabbit";
import ComandosUsuario from "../comandos";

/** No tiene ningun routing key que sea de deslogeo o algo
 * este mensaje de auth, y solo envia el token, pero bueno
 * solo sucede al deslogearse asi que lo asumimos como deslogeo.
 */
void fabricaConsumirMensajeExchangeRabbit<string>(
  "auth",
  TIPOS_EXCHANGE.FANOUT,
  "delivery_user_logout",
  "",
  { durable: false },
  async (mensaje) => {
    const token = mensaje.message.split(" ")[1];
    await ComandosUsuario.invalidarToken(token);
  }
);
