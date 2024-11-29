import { ZodError } from "zod";
import { CodigosHTTP } from "../codigosHTTP";

export enum CodigosError {
  AUTENTICACION,
  AUTORIZACION,
  VALIDACION_DTO,
  RECURSO_YA_EXISTENTE,
  RECURSO_AJENO,
  RECURSO_NO_ENCONTRADO,
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

// Raro, pero cuando falla algo en la autenticacion con Kinde. No definido bien aun
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

// Cuando el usuario no tiene permiso
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

// Los datos de la request no cumplen con lo aceptado por el endpoint.
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

// Cuando se desea insertar o actualizar algo que quitaria integridad a la base de datos, como insertar o actualizar la patente de un vehiculo,
// cuando esa patente ya la tiene otro vehiculo.
export class ErrorConflictoRecursoExistente extends ErrorAplicacion {
  public nombreRecurso: string;
  constructor(nombreRecurso: string, mensajeForzado?: string) {
    super(
      "Error de datos duplicados",
      CodigosHTTP.CONFLICT,
      mensajeForzado ??
        "Ya existe un recurso igual al que deseas ingresar: " + nombreRecurso,
      CodigosError.RECURSO_YA_EXISTENTE
    );
    Object.setPrototypeOf(this, ErrorConflictoRecursoExistente.prototype);
    this.name = "ErrorConflictoRecursoExistente";
    this.nombreRecurso = nombreRecurso;
  }
}

// Cuando se envian parametros que no son numeros en la parte de paginacion
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
