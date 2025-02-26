import amqp from "amqplib";
import { logger } from "../utils/logger";
import { ErrorConexionRabbit } from "../errores/clasesErrores";

export let conexionRabbit: amqp.Connection;

export const conectarRabbit = async () => {
  try {
    if (!conexionRabbit) {
      conexionRabbit = await amqp.connect(process.env.RABBIT_URL);
      logger.info("Conexión establecida con RabbitMQ");
    }
    return conexionRabbit;
  } catch (error) {
    logger.error("Error al conectar con RabbitMQ:", error);
    throw new ErrorConexionRabbit(error instanceof Error ? error.message : undefined);
  }
};

export const desconectarRabbit = async () => {
  if (conexionRabbit) {
    await conexionRabbit.close();
    logger.info("Desconectado de RabbitMQ");
  }
};

export const TIPOS_EXCHANGE = {
  DIRECT: "direct",
  FANOUT: "fanout",
  TOPIC: "topic",
  HEADERS: "headers",
} as const;
export const DELIVERY_EXCHANGE = "exchange_delivery";

export const fabricaEmitirMensajeExchangeRabbit =
  <T>(
    exchange: string,
    tipoExchange: (typeof TIPOS_EXCHANGE)[keyof typeof TIPOS_EXCHANGE],
    routingKey: string
  ) =>
  async (mensaje: T) => {
    const conexion = await conectarRabbit();
    const canal = await conexion.createChannel();
    await canal.assertExchange(exchange, tipoExchange);
    canal.publish(DELIVERY_EXCHANGE, routingKey, Buffer.from(JSON.stringify(mensaje)));
  };

export const fabricaConsumirMensajeExchangeRabbit = async <T>(
  exchange: string,
  tipoExchange: (typeof TIPOS_EXCHANGE)[keyof typeof TIPOS_EXCHANGE],
  opcionesExchange: amqp.Options.AssertExchange,
  routingKey: string,
  callback: (mensaje: T) => Promise<void>
) => {
  const conexion = await conectarRabbit();
  const canal = await conexion.createChannel();
  await canal.assertExchange(exchange, tipoExchange, opcionesExchange);
  const { queue } = await canal.assertQueue("", { exclusive: true });
  await canal.bindQueue(queue, exchange, routingKey);
  await canal.consume(
    queue,
    async (mensaje) => {
      if (mensaje) {
        await callback(JSON.parse(mensaje.content.toString()) as T);
        canal.ack(mensaje);
      }
    },
    { noAck: false }
  );
};
