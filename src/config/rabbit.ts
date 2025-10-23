import amqp from "amqplib";
import { logger } from "../utils/logger";
import { ErrorAplicacion, ErrorConexionRabbit } from "../errores/clasesErrores";

export let conexionRabbit: amqp.Connection;

/**
 * A usar cada vez que se quiera interactuar con Rabbit. Si ya esta conectado simplemente devuelve
 * la conexion existente.
 */
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

/** Tipo compartido que todos los mensajes de rabbit respetan */
export type MensajeRabbit<T> = {
  correlation_id: string;
  exhange: string;
  routing_key: string;
  message: T;
};

/**
 * Se encarga de conectar con rabbit, assert el exchange, y enviar el mensaje a donde se le indique por parametro.
 */
export const fabricaEmitirMensajeExchangeRabbit =
  <T>(
    exchange: string,
    tipoExchange: (typeof TIPOS_EXCHANGE)[keyof typeof TIPOS_EXCHANGE],
    routingKey: string
  ) =>
  async (mensaje: T, correlation_id?: string) => {
    const conexion = await conectarRabbit();
    const canal = await conexion.createChannel();
    await canal.assertExchange(exchange, tipoExchange);
    const mensajeEstandarizado: MensajeRabbit<T> = {
      correlation_id: correlation_id ?? "",
      exhange: exchange,
      routing_key: routingKey,
      message: mensaje,
    };
    logger.info(mensajeEstandarizado, "Mensaje emitido a Rabbit");
    canal.publish(exchange, routingKey, Buffer.from(JSON.stringify(mensajeEstandarizado)));
  };

/**
 * Recibe parametros del mensaje que desee recibirse y el callback que se ejecuta al recibir ese tipo de mensajes.
 * Se encarga de realizar la conexion con rabbit, assert el exchange y la queue, consumir el mensaje y enviar el ack
 */
export const fabricaConsumirMensajeExchangeRabbit = async <T>(
  exchange: string,
  tipoExchange: (typeof TIPOS_EXCHANGE)[keyof typeof TIPOS_EXCHANGE],
  nombreQueue = "",
  routingKey: string,
  opcionesExchange: amqp.Options.AssertExchange,
  callback: (mensaje: MensajeRabbit<T>) => Promise<void> | void
) => {
  const conexion = await conectarRabbit();
  const canal = await conexion.createChannel();
  await canal.assertExchange(exchange, tipoExchange, opcionesExchange);
  const { queue } = await canal.assertQueue(nombreQueue);
  await canal.bindQueue(queue, exchange, routingKey);
  await canal.consume(
    queue,
    async (mensaje) => {
      console.log("EXCHANGE: ", exchange);
      console.log("QUEUE: ", queue);
      if (mensaje) {
        try {
          console.log("MENSAJE RECIBIDO json: ", JSON.parse(mensaje.content.toString()));
          const mensajeJSON = JSON.parse(mensaje.content.toString()) as MensajeRabbit<T>;
          logger.info({ exchange, queue, routingKey, mensajeJSON }, "Mensaje recibido de rabbit");
          await callback(mensajeJSON);
          canal.ack(mensaje);
        } catch (error) {
          if (error instanceof SyntaxError)
            logger.error(error, "Error en el formato JSON del mensaje");
          // Los errores de rabbit no tienen un manejador global, asi que los atrapamos
          // aca y solo logeamos sus datos
          else if (error instanceof ErrorAplicacion) {
            // intentamos parsear el objeto del mensaje
            let contenidoMensaje: unknown = null;
            try {
              contenidoMensaje = JSON.parse(mensaje.content.toString());
            } catch (error) {
              //no hacemos nada
            }
            logger.error(
              {
                error: {
                  name: error.name,
                  message: error.message,
                  codigoIdentificacion: error.codigoIdentificacion,
                },
                contexto: { exchange, queue, routingKey, contenidoMensaje },
              },
              "Error consumiendo Rabbit"
            );
          } else {
            logger.error(error, "Error consumiendo el mensaje");
          }
        }
      }
    },
    { noAck: false }
  );
};
