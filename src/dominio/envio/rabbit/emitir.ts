import { Point } from "geojson";
import { Envio } from "../schema";
import { DELIVERY_EXCHANGE, fabricaEmitirMensajeExchangeRabbit } from "../../../config/rabbit";

export const emitirEnvioCreado = fabricaEmitirMensajeExchangeRabbit<Envio>(
  DELIVERY_EXCHANGE,
  "direct",
  "envio.creado"
);

export const emitirEnvioDespachado = fabricaEmitirMensajeExchangeRabbit<{
  envioId: string;
  codigoRecepcionCliente: number;
}>(DELIVERY_EXCHANGE, "direct", "envio.despachado");

export const emitirEnvioUbicacionActualizada = fabricaEmitirMensajeExchangeRabbit<{
  envioId: string;
  coordenadas: Point;
  fyhUbicacion: Date;
}>(DELIVERY_EXCHANGE, "direct", "envio.ubicacion_actualizada");

export const emitirEnvioEntregado = fabricaEmitirMensajeExchangeRabbit<{
  envioId: string;
  fyhEntrega: Date;
}>(DELIVERY_EXCHANGE, "direct", "envio.entregado");

export const emitirEnvioCercanoADestino = fabricaEmitirMensajeExchangeRabbit<{
  envioId: string;
  distanciaRestanteKm: number;
  tiempoRestanteAproximadoMin: number;
}>(DELIVERY_EXCHANGE, "direct", "envio.cercano_a_destino");
