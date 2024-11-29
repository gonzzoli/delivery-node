import { ZodError } from "zod";
import { CodigosHTTP } from "../codigosHTTP";
import { DatabaseError } from "pg";
import { MensajesErrorTabla } from "../../tipos/programacion/tiposError";
import mapearErrorBD from "./mapearErrorBD";
import type { ConsultaBD } from "../../lib/bd/bd";

export enum CodigosError {
  AUTENTICACION,
  AUTORIZACION,
  VALIDACION_DTO,
  PATENTE_FORMATO_INVALIDO,
  PREPARAR_DATOS_BD,
  QUERY_BD,
  RECURSO_YA_EXISTENTE,
  CHOFER_NO_PERTENECE_A_EMPRESA,
  RECURSO_AJENO,
  EMAIL_USUARIO_YA_REGISTRADO,
  ORDENAMIENTO_INVALIDO,
  PAGINACION_INVALIDA,
  RECURSO_NO_ENCONTRADO,
  OPCION_ATRIBUTO_INVALIDA,
  ATRIBUTO_RESTRICCION_INVALIDA,
}

// son solo algunos de los tipos de errores que pueden surgir en el servidor. Vamos a tener cientos
// de errores probablemente en el futuro, asi que despues veremos alguna mejor forma de organizarlos.

const mensajeErrorAplicacion = {
  titulo: "Error interno",
  descripcion:
    "Sucedio un error interno del servidor. Si el problema persiste, comuniquese con el soporte tecnico.",
};

export class ErrorAplicacion extends Error {
  public titulo: string;
  public codigoHTTP: CodigosHTTP;
  public codigoIdentificacion: number;
  public endpoint?: string;
  constructor(
    titulo: string,
    codigoHTTP: CodigosHTTP,
    descripcion: string,
    codigoIdentificacion: number
  ) {
    super(descripcion);
    Object.setPrototypeOf(this, new.target.prototype);

    this.titulo = titulo;
    this.codigoHTTP = codigoHTTP;
    this.codigoIdentificacion = codigoIdentificacion;

    //Error.captureStackTrace(this);
  }
}

/**
 * Errores que devuelve pg al hacer una query a la base de datos.
 * Solo salta de alguna de las 4 funciones en bd.ts
 */
export class ErrorQueryBD extends ErrorAplicacion {
  public databaseError: DatabaseError;
  public consultaFallida: ConsultaBD;
  constructor(databaseError: DatabaseError, consultaFallida: ConsultaBD) {
    super(
      mensajeErrorAplicacion.titulo,
      CodigosHTTP.INTERNAL_SERVER_ERROR,
      mensajeErrorAplicacion.descripcion,
      CodigosError.QUERY_BD
    );
    Object.setPrototypeOf(this, ErrorQueryBD.prototype);
    this.name = "ErrorQueryBD";
    this.databaseError = databaseError;
    this.consultaFallida = consultaFallida;
  }
}

/**
 * Errores atrapados en un repositorio (tryCatchRepo) que pueden deberse a un mal insert, select, etc.
 * Si es por alguna constraint que hemos definido nosotros, deberia generar un mensaje que posiblemente
 * podriamos enviar o dejar leer al usuario.
 */
export class ErrorRepositorio extends ErrorAplicacion {
  public constraint: string;
  public errorCompleto: DatabaseError;
  public consultaFallida: ConsultaBD;
  constructor(error: ErrorQueryBD, mensajesErrorTabla: MensajesErrorTabla) {
    super(
      mensajeErrorAplicacion.titulo,
      CodigosHTTP.INTERNAL_SERVER_ERROR,
      mapearErrorBD(error, mensajesErrorTabla),
      CodigosError.QUERY_BD
    );
    Object.setPrototypeOf(this, ErrorRepositorio.prototype);
    this.name = "ErrorRepositorio";
    this.constraint = error.databaseError.constraint ?? "Constraint no definida";
    this.consultaFallida = error.consultaFallida;
    this.errorCompleto = error.databaseError;
  }
}
/**
 * Raro, y seria problema nuestro, cuando la funcion prepararDatosBD falla por alguna razon.
 * Aunque no deberia nunca fallar
 */
export class ErrorPrepararDatosBD extends ErrorAplicacion {
  constructor() {
    super(
      mensajeErrorAplicacion.titulo,
      CodigosHTTP.INTERNAL_SERVER_ERROR,
      mensajeErrorAplicacion.descripcion,
      CodigosError.PREPARAR_DATOS_BD
    );
    Object.setPrototypeOf(this, ErrorPrepararDatosBD.prototype);
    this.name = "ErrorPrepararDatosBD";
  }
}

/**
 * Raro, pero cuando falla algo en la autenticacion con Kinde. No definido bien aun
 */
export class ErrorAutenticacion extends ErrorAplicacion {
  constructor(mensajeForzado?: string) {
    super(
      "Usuario no autenticado",
      CodigosHTTP.FORBIDDEN,
      mensajeForzado ?? "Debes registrarte o iniciar sesion para realizar esta accion.",
      CodigosError.AUTENTICACION
    );
    Object.setPrototypeOf(this, ErrorAutenticacion.prototype);
    this.name = "ErrorAutenticacion";
  }
}

/**
 * Cuando el usuario no tiene permiso
 */
export class ErrorAutorizacion extends ErrorAplicacion {
  constructor(mensajeForzado?: string) {
    super(
      "No autorizado",
      CodigosHTTP.UNAUTHORIZED,
      mensajeForzado ?? "No tienes autorizacion para realizar esta accion!",
      CodigosError.AUTORIZACION
    );
    Object.setPrototypeOf(this, ErrorAutorizacion.prototype);
    this.name = "ErrorAutorizacion";
  }
}

/**
 * Los datos de la request no cumplen con lo aceptado por el endpoint.
 */
export class ErrorValidacionDTO extends ErrorAplicacion {
  //public detallesError: { campo: string; descripcion: string };
  public errorZod: ZodError;
  constructor(errorZod: ZodError, mensajeForzado?: string) {
    // luego agregar a descripcion una lista separada por comas de los campos que son incorrectos
    super(
      "Formato de solicitud invalido.",
      CodigosHTTP.BAD_REQUEST,
      mensajeForzado ??
        "Falta o es incorrecto alguno de los parametros requeridos para realizar esta accion",
      CodigosError.VALIDACION_DTO
    );
    Object.setPrototypeOf(this, ErrorValidacionDTO.prototype);
    this.name = "ErrorValidacionDTO";
    this.errorZod = errorZod;
  }
}

/**
 * Cuando se desea insertar o actualizar algo que quitaria integridad a la base de datos, como insertar o actualizar la patente de un vehiculo,
 * cuando esa patente ya la tiene otro vehiculo.
 */
export class ErrorConflictoRecursoExistente extends ErrorAplicacion {
  public nombreRecurso: string;
  constructor(nombreRecurso: string, mensajeForzado?: string) {
    super(
      "Error de datos duplicados",
      CodigosHTTP.CONFLICT,
      mensajeForzado ?? "Ya existe un recurso igual al que deseas ingresar: " + nombreRecurso,
      CodigosError.RECURSO_YA_EXISTENTE
    );
    Object.setPrototypeOf(this, ErrorConflictoRecursoExistente.prototype);
    this.name = "ErrorConflictoRecursoExistente";
    this.nombreRecurso = nombreRecurso;
  }
}

/**
 * Cuando se intenta registrar un usuario cuyo email ya esta registrado. Creo que no hay caso razonable en el que pueda
 * suceder este error.
 */
export class ErrorEmailUsuarioYaRegistrado extends ErrorAplicacion {
  public email: string;
  constructor(email: string, mensajeForzado?: string) {
    super(
      "Error de email ya registrado",
      CodigosHTTP.CONFLICT,
      mensajeForzado ?? "Ya existe un usuario registrado con el mail " + email,
      CodigosError.EMAIL_USUARIO_YA_REGISTRADO
    );
    Object.setPrototypeOf(this, ErrorEmailUsuarioYaRegistrado.prototype);
    this.name = "ErrorEmailUsuarioYaRegistrado";
    this.email = email;
  }
}

/**
 * Cuando se desea buscar algun recurso que no pertenece al usuario o no esta autorizado. Por ejemplo, un propietario
 * busca un vehiculo por id que no le pertenece.
 */
export class ErrorRecursoAjeno extends ErrorAplicacion {
  constructor(mensajeForzado?: string) {
    super(
      "Error de recurso ajeno",
      CodigosHTTP.FORBIDDEN,
      mensajeForzado ??
        "Parece que el recurso que intentas buscar no te pertenece, por lo que no puedes acceder a el.",
      CodigosError.RECURSO_AJENO
    );
    Object.setPrototypeOf(this, ErrorRecursoAjeno.prototype);
    this.name = "ErrorRecursoAjeno";
  }
}

/**
 * La patente no tiene ninguno de los formatos admitidos
 */
export class ErrorFormatoPatenteInvalido extends ErrorAplicacion {
  public patente: string;
  constructor(patenteIngresada: string, mensajeForzado?: string) {
    super(
      "Patente ingresada invalida",
      CodigosHTTP.BAD_REQUEST,
      mensajeForzado ??
        "El formato de la patente ingresada no es valido. Los formatos aceptados son XXX123 y XX123XX.",
      CodigosError.PATENTE_FORMATO_INVALIDO
    );
    Object.setPrototypeOf(this, ErrorFormatoPatenteInvalido.prototype);
    this.name = "ErrorFormatoPatenteInvalido";
    this.patente = patenteIngresada;
  }
}

/**
 * Cuando se envian parametros que no son numeros en la parte de paginacion
 */
export class ErrorPaginacionInvalida extends ErrorAplicacion {
  public pagina: unknown;
  public cantPorPagina: unknown;
  public maxCantPorPagina: unknown;
  constructor(
    pagina: unknown,
    cantPorPagina: unknown,
    maxCantPorPagina: unknown,
    mensajeForzado?: string
  ) {
    super(
      "Paginacion invalida",
      CodigosHTTP.BAD_REQUEST,
      mensajeForzado ??
        "Los valores enviados para paginar los resultados no son validos. Revise la peticion y asegurese de que sean numeros enteros.",
      CodigosError.PAGINACION_INVALIDA
    );
    Object.setPrototypeOf(this, ErrorPaginacionInvalida.prototype);
    this.name = "ErrorPaginacionInvalida";
    this.pagina = pagina;
    this.cantPorPagina = cantPorPagina;
    this.maxCantPorPagina = maxCantPorPagina;
  }
}

/**
 * Cuando se envian parametros que no son numeros en la parte de paginacion
 */
export class ErrorOrdenamientoInvalido extends ErrorAplicacion {
  public ordenamientoElegido: string;
  constructor(ordenamientoElegido: string, mensajeForzado?: string) {
    super(
      "Ordenamiento invalido",
      CodigosHTTP.BAD_REQUEST,
      mensajeForzado ??
        "La búsqueda no puede ordenarse como fué solicitado: " + ordenamientoElegido,
      CodigosError.ORDENAMIENTO_INVALIDO
    );
    Object.setPrototypeOf(this, ErrorOrdenamientoInvalido.prototype);
    this.name = "ErrorOrdenamientoInvalido";
    this.ordenamientoElegido = ordenamientoElegido;
  }
}

/**
 * Cuando se envian parametros que no son numeros en la parte de paginacion
 */
export class ErrorRecursoNoEncontrado extends ErrorAplicacion {
  constructor(mensajeForzado?: string) {
    super(
      "Recurso no encontrado",
      CodigosHTTP.NOT_FOUND,
      mensajeForzado ??
        "El recurso que se buscaba no pudo ser encontrado. Puede que no exista o que haya ingresado mal los datos.",
      CodigosError.RECURSO_NO_ENCONTRADO
    );
    Object.setPrototypeOf(this, ErrorRecursoNoEncontrado.prototype);
    this.name = "ErrorRecursoNoEncontrado";
  }
}

/**
 * Cuando se valida un valor frente a una restriccion de un atributo y no la satisface
 */
export class ErrorValorNoSatisfaceRestriccionAtributo extends ErrorAplicacion {
  constructor(nombreRestriccion: string, valorInvalido: string, mensajeForzado?: string) {
    super(
      "Valor no satisface restriccion",
      CodigosHTTP.BAD_REQUEST,
      mensajeForzado ??
        `El valor ${valorInvalido} no satisface la restriccion ${nombreRestriccion}. Por favor, revise la peticion`,
      CodigosError.OPCION_ATRIBUTO_INVALIDA
    );
    Object.setPrototypeOf(this, ErrorValorNoSatisfaceRestriccionAtributo.prototype);
    this.name = "ErrorValorNoSatisfaceRestriccionAtributo";
  }
}

/**
 * Cuando una de las restricciones del atributo que se quiere crear o modificar no es valida (distinto tipo de dato al del atributo o no existe la restriccion)
 */
export class ErrorAtributoRestriccionInvalida extends ErrorAplicacion {
  constructor(restriccionInvalida: string, valorInvalido: string, mensajeForzado?: string) {
    super(
      "Restriccion de atributo invalida",
      CodigosHTTP.BAD_REQUEST,
      mensajeForzado ??
        `La restriccion ${restriccionInvalida}: ${valorInvalido} no es valida para el atributo. Por favor, revise la peticion`,
      CodigosError.ATRIBUTO_RESTRICCION_INVALIDA
    );
    Object.setPrototypeOf(this, ErrorAtributoRestriccionInvalida.prototype);
    this.name = "ErrorAtributoRestriccionInvalida";
  }
}
