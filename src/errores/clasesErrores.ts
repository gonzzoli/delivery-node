import { ZodError } from "zod";
import { CodigosHTTP } from "../utils/codigosHTTP";

export enum CodigosError {
  AUTENTICACION,
  AUTORIZACION,
  VALIDACION_DTO,
  CONEXION_BD,
  CONEXION_RABBIT,
  PREPARAR_DATOS_BD,
  QUERY_BD,
  RECURSO_YA_EXISTENTE,
  RECURSO_AJENO,
  RECURSO_NO_ENCONTRADO,
  ENTIDAD_ACCION_INVALIDA,
  ENVIO_INTERNACIONAL,
}

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
    console.log("ERROR DESCRIP", descripcion);
    super(descripcion);
    Object.setPrototypeOf(this, new.target.prototype);

    this.titulo = titulo;
    this.codigoHTTP = codigoHTTP;
    this.codigoIdentificacion = codigoIdentificacion;

    //Error.captureStackTrace(this);
  }
}

/**
 * Cuando falla la conexion con la base de datos al iniciar el servidor
 */
export class ErrorConexionBD extends ErrorAplicacion {
  constructor(error?: string) {
    super(
      "Error en conexion a BD",
      CodigosHTTP.FORBIDDEN,
      error ?? "Ocurrió un error al conectar a la base de datos",
      CodigosError.CONEXION_BD
    );
    Object.setPrototypeOf(this, ErrorConexionBD.prototype);
    this.name = "ErrorConexionBD";
  }
}

/**
 * Cuando falla la conexion con Rabbit
 */
export class ErrorConexionRabbit extends ErrorAplicacion {
  constructor(error?: string) {
    super(
      "Error en conexion a RabbitMQ",
      CodigosHTTP.FORBIDDEN,
      error ?? "Ocurrió un error al conectar a RabbitMQ",
      CodigosError.CONEXION_RABBIT
    );
    Object.setPrototypeOf(this, ErrorConexionRabbit.prototype);
    this.name = "ErrorConexionRabbit";
  }
}

/**
 * Cuando no hay JWT o no es valido
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
 * Cuando se desea insertar o actualizar algo que quitaria integridad a la base de datos
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
 * Cuando se desea buscar algun recurso que no pertenece al usuario o no esta autorizado.
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
 * Cuando no se encuentra un recurso que se buscaba, y no puede seguirse con la operación.
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
 * Cuando se envian parametros que no son numeros en la parte de paginacion
 */
export class ErrorEnvioNoPosible extends ErrorAplicacion {
  constructor(mensajeForzado?: string) {
    super(
      "Envio no posible",
      CodigosHTTP.BAD_REQUEST,
      mensajeForzado ?? "No es posible realizar el envío",
      CodigosError.ENVIO_INTERNACIONAL
    );
    Object.setPrototypeOf(this, ErrorEnvioNoPosible.prototype);
    this.name = "ErrorEnvioNoPosible";
  }
}

/**
 * Cuando se intenta realizar una accion sobre una entidad que no es aplicable
 * en el momento por el estado actual de la entidad
 */
export class ErrorEntidadAccionInvalida extends ErrorAplicacion {
  constructor(mensajeForzado?: string) {
    super(
      "Acción invalida sobre la entidad",
      CodigosHTTP.BAD_REQUEST,
      mensajeForzado ?? "La acción que estas intentando realizar sobre la entidad no es valida.",
      CodigosError.ENTIDAD_ACCION_INVALIDA
    );
    Object.setPrototypeOf(this, ErrorEntidadAccionInvalida.prototype);
    this.name = "ErrorEntidadAccionInvalida";
  }
}
