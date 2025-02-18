import { DELIVERY_EXCHANGE, fabricaEmitirMensajeExchangeRabbit } from ".";
import { Envio, Punto } from "../dominio/envio/schema";

export const emitirEnvioCreado = fabricaEmitirMensajeExchangeRabbit<Envio>(
  DELIVERY_EXCHANGE,
  "envio.creado"
);

export const emitirEnvioDespachado = fabricaEmitirMensajeExchangeRabbit<{
  envioId: Envio["envioId"];
  codigoRecepcionCliente: number;
}>(DELIVERY_EXCHANGE, "envio.despachado");

export const emitirEnvioUbicacionActualizada = fabricaEmitirMensajeExchangeRabbit<{
  envioId: Envio["envioId"];
  coordenadas: Punto;
  fyhUbicacion: Date;
}>(DELIVERY_EXCHANGE, "envio.ubicacion_actualizada");

export const emitirEnvioEntregado = fabricaEmitirMensajeExchangeRabbit<{
  envioId: Envio["envioId"];
  fyhEntrega: Date;
}>(DELIVERY_EXCHANGE, "envio.entregado");

export const emitirEnvioCercanoADestino = fabricaEmitirMensajeExchangeRabbit<{
  envioId: Envio["envioId"];
  distanciaRestanteKm: number;
  tiempoRestanteAproximadoMin: number;
}>(DELIVERY_EXCHANGE, "envio.cercano_a_destino");
