import { fabricaConsumirMensajeExchangeRabbit, TIPOS_EXCHANGE } from "../../../config/rabbit";
import { registrarUsuario } from "../comandos/registrarUsuario";

// Esto no lo emite realmente auth, asi que debe simularse desde el panel de rabbit. Solo envia
// usuarioId porque la ubicacion es algo que maneja este microservicio. Recibe el userID
void fabricaConsumirMensajeExchangeRabbit<{ userId: string }>(
  "user_registered",
  TIPOS_EXCHANGE.FANOUT,
  "delivery_user_registered",
  "",
  { durable: true },
  async (mensaje) => {
    await registrarUsuario(mensaje.userId);
  }
);
