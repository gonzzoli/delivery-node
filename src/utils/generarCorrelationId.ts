import { randomUUID } from "crypto";
/** Funcion simple para centralizar donde se generan correlation_id por si cambia la logica */
export default function generarCorrelationId() {
  return randomUUID();
}
