// Para calcular el volumen de cualquier objeto que tenga

// estas tres propiedades al menos
type ObjetoDimensionado = {
  largoMts: DimensionMts;
  anchoMts: DimensionMts;
  altoMts: DimensionMts;
  [key: string]: unknown;
};

export const calcularVolumenMtsCubicos = (objeto: ObjetoDimensionado) =>
  (objeto.altoMts * objeto.anchoMts * objeto.largoMts) as VolumenMtsCubicos;
