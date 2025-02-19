import amqp from "amqplib";
import { logger } from "../utils/logger";
import { ErrorConexionRabbit } from "../errores/clasesErrores";

export let conexionRabbit: amqp.Connection;

export const conectarRabbit = async () => {
  try {
    if (!conexionRabbit) {
      conexionRabbit = await amqp.connect("amqp://localhost:3000");
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

export const fabricaEmitirMensajeExchangeRabbit =
  <T>(
    exchange: string,
    tipoExchange: (typeof TIPOS_EXCHANGE)[keyof typeof TIPOS_EXCHANGE],
    routingKey: string
  ) =>
  async (mensaje: T) => {
    const conexion = await conectarRabbit();
    const canal = await conexion.createChannel();
    await canal.assertExchange(exchange, tipoExchange, { durable: true });
    canal.publish(DELIVERY_EXCHANGE, routingKey, Buffer.from(JSON.stringify(mensaje)));
  };

export const fabricaConsumirMensajeExchangeRabbit =
  (
    exchange: string,
    tipoExchange: (typeof TIPOS_EXCHANGE)[keyof typeof TIPOS_EXCHANGE],
    routingKey: string
  ) =>
  async (callback: (mensaje: unknown) => void) => {
    const conexion = await conectarRabbit();
    const canal = await conexion.createChannel();

    await canal.assertExchange(exchange, tipoExchange, { durable: true });
    const { queue } = await canal.assertQueue("", { exclusive: true });
    await canal.bindQueue(queue, exchange, routingKey);
    await canal.consume(
      queue,
      (mensaje) => {
        if (mensaje) {
          callback(JSON.parse(mensaje.content.toString()));
          canal.ack(mensaje);
        }
      },
      { noAck: false }
    );
  };

export const DELIVERY_EXCHANGE = "delivery_exchange";
