import { DELIVERY_EXCHANGE, fabricaEmitirMensajeExchangeRabbit } from ".";
import { Envio, Punto } from "../dominio/envio/schema";

export const emitirEnvioCreado = fabricaEmitirMensajeExchangeRabbit<Envio>(
  DELIVERY_EXCHANGE,
  "direct",
  "envio.creado"
);

export const emitirEnvioDespachado = fabricaEmitirMensajeExchangeRabbit<{
  envioId: Envio["envioId"];
  codigoRecepcionCliente: number;
}>(DELIVERY_EXCHANGE, "direct", "envio.despachado");

export const emitirEnvioUbicacionActualizada = fabricaEmitirMensajeExchangeRabbit<{
  envioId: Envio["envioId"];
  coordenadas: Punto;
  fyhUbicacion: Date;
}>(DELIVERY_EXCHANGE, "direct", "envio.ubicacion_actualizada");

export const emitirEnvioEntregado = fabricaEmitirMensajeExchangeRabbit<{
  envioId: Envio["envioId"];
  fyhEntrega: Date;
}>(DELIVERY_EXCHANGE, "direct", "envio.entregado");

export const emitirEnvioCercanoADestino = fabricaEmitirMensajeExchangeRabbit<{
  envioId: Envio["envioId"];
  distanciaRestanteKm: number;
  tiempoRestanteAproximadoMin: number;
}>(DELIVERY_EXCHANGE, "direct", "envio.cercano_a_destino");
