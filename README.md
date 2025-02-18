- **Alumno:** Gonzalo Pozzoli
- **Legajo:** 49028

Se plantea agregar un microservicio de delivery que manejará los casos de uso referidos al envío de los productos desde la dirección de origen de una orden hacia la dirección del cliente.

Se deberá registrar ahora para cada usuario las coordenadas de su direccion. La direccion será usada tanto para despacho de pedidos asi como para entregas. En una versión futura podrían dividirse las direcciones y tener especificas para cada acción. 
En esta primera versión se realizará 1 envio distinto para cada grupo de articulos. Es decir, si la orden contiene 3 articulos distintos A, B, y C, (sin importar sus cantidades) se generarán 3 envios distintos relacionados a la misma orden. En versiones futuras se puede implementar un algoritmo de rutas que planifique un solo envio para todos los articulos.

De cada artículo se mantendrán sus dimensiones y peso en este microservicio, siendo manejables mediante un endpoint REST.

Para obtener los datos del usuario y puntualmente su direccion, se simulará un mensaje de UserRegistered que se emitiría desde Auth cuando se cree un nuevo usuario, obteniendo de allí su ID, nombre, y direccion para almacenar en este microservicio.

# Casos de uso

## Modificar dirección de usuario
**Precondicion:** usuario debe estar registrado 
**Camino normal**
- El usuario puede cambiar las coordenadas de su dirección. La provincia se actualizará automaticamente en base a las coordenadas. Únicamente puede tener 1 dirección. 
- La dirección será usada como punto de origen para las ventas del usuario, y como punto de destino para las compras del usuario.
- Modificar la dirección mientras hay envíos en curso no afecta la ruta ya que el envío mantienen la direccion de origen y destino con las que se generó el envío.
**Caminos alternativos:**
- Si la dirección se ubica fuera de la Argentina se devuelve un error "El servicio solo está disponible dentro de Argentina"

## Modificar dimensiones de articulo
Las dimensiones y peso de los articulos se mantendrán en este microservicio. 
**Precondicion:** artículo existente en Catalog
**Camino normal**
- Se busca el artículo en la base de datos del microservicio de Delivery.
- Si existe, se actualizan sus dimensiones con las nuevas recibidas

**Caminos alternativos**
- Si no se encuentra el artículo en la BD del microservicio de Delivery, se realiza una petición HTTP a Catalog para buscar el articulo por id. 
- Si la petición es exitosa y el artículo existe entonces se almacenan las dimensiones junto al article_id en la base de datos
- Si la petición a Catalog no encuentra el artículo por id entonces se lanza el error "No se encontró el articulo en el catálogo de articulos."

## Calcular envío de orden
 Sería utilizado principalmente por Cart para mostrar el costo de envío en conjunto con los articulos del carrito (get_cart). Tambien al momento de generar el envío de orden.

**Precondicion:** usuario debe estar logeado para poder tener su direccion. 
**Camino normal**
- Busca en base de datos los precios unitarios para cada uno de los parametros (precio por km, precio por m2, precio por kg).
- Se busca la direccion del usuario en la base de datos
- Se calculan los envíos de cada articulo con sus cantidades, desde el origen indicado por la petición hasta la direccion del usuario que la realiza. 
- Si la cantidad de unidades del articulo es más de 1, la primera unidad se cobra la totalidad del costo, y las demás tienen un 50% de descuento (para simular el ahorro de llevar muchas unidades en un solo viaje). 
- Devuelve el costo, distancia, y duracion de viaje estimados.
**Caminos alternativos**
- Si la ubicacion de origen es fuera de la Argentina se devuelve un error indicando que no es posible realizar envíos internacionales. 
- Si el envío debe atravesar provincias, el costo debe duplicarse sin importar la distancia.
- Si alguno de los articulos no tiene sus dimensiones cargadas, se devuelve un error 404 con el mensaje "No están cargadas las dimensiones del articulo {nombre del articulo}"

## Generar envío de orden
**Precondición:** orden generada desde Order
**Camino normal**
- Consume el evento "order_placed" de Orders
- Se realizan los pasos del CU "Calcular envío de orden"
- Si todos los envíos son posibles entonces se genera el evento "EventoEnvioCreado" por cada uno de ellos, se emite, y también se persisten los eventos en la base de datos.
- Crea las proyecciones de cada envío, en estado "PENDIENTE DE DESPACHO"
**Camino alternativo**
- Si la ubicacion de origen es fuera de la Argentina se emite el evento "EventoEnvioNoPosible" con la razón en el body ("Envio internacional"). 
- Para cada envío, si la orden debe atravesar una o mas provincias, su precio calculado se duplica y ese es el precio final

## Iniciar envío
**Precondición:** envío en estado "PENDIENTE DE DESPACHO"
**Camino normal**
- Se genera el evento "EventoEnvioDespachado" que contiene la hora de inicio del envío, la hora estimada de llegada (en base a la duración de envío calculada cuando se generó). Se almacena y se emite.
- Se genera seguidamente un evento de "EventoEnvioUbicacionActualizada" para mantener registro del recorrido desde el punto de origen. Se almacena y se emite.
- Actualiza la proyección del envío, quedando en estado "EN CAMINO"

## Registrar entrega de orden
**Precondicion:** envío en estado "EN CAMINO"
**Camino normal**
- Genera el evento "EventoEnvioEntregado" con la fecha y hora de entrega, lo emite y lo almacena. 
- Actualiza la proyección del envío, quedando en estado "ENTREGADO"

## Actualizar ubicación del pedido
**Precondición:** envío en estado "EN CAMINO"
- El administrador actualiza la ubicación actual del pedido brindando las nuevas coordenadas. Se genera un evento "EventoEnvioUbicacionActualizada", se emite y se almacena.
- Se recalculan los campos "tiempo_estimado_entrega", "distancia_a_destino".
- Si la ubicación es menor a 100km se lanza un evento "EventoEnvioCercanoADestino" (que debería desencadenar en una notificación al cliente, responsabilidad que debería ser de Notifications).
- Se actualiza la proyección del envío, mantiene el estado "EN CAMINO"

# Entidades

Para la definición de los Ids de las entidades utilizo el concepto de Tagged Type en Typescript, que es un tipo utilitario que sirve para permitirle al compilador de Typescript distinguir entre datos que tienen un mismo tipo primitivo base, pero que conceptualmente queremos indicar que representan cosas distintas y deben distinguirse.

```ts
// Tagged Types, tipo utilitario: https://medium.com/@ethanresnick/advanced-typescript-tagged-types-improved-with-type-level-metadata-5072fc125fcf
const tags: unique symbol = Symbol("tags");
export type Etiquetado<TipoBase, Etiqueta extends PropertyKey> = TipoBase & {
  [tags]: { [K in Etiqueta]: void };
};
```

Y dado que voy a almacenar al Envio bajo el concepto de Event Sourcing definí este tipo para los eventos que van a almacenarse. Es genérico, por lo que puede servir tanto para eventos del Envio como para otras entidades. Estos eventos pueden pasarse por una funcion de mapeo para generar los mensajes de Rabbit.

```ts
type EventoAplicacion<
  AgregadoTipo extends string,
  AgregadoId extends EntidadId,
  NombreEvento extends string,
  Contenido extends Record<string, unknown> | null
> = {
  id: Etiquetado<string, "EventoAplicacionId">;
  agregadoId: AgregadoId;
  agregadoTipo: AgregadoTipo;
  fyhEvento: FechaHoraEvento;
  secuenciaEvento: number;
  nombreEvento: NombreEvento;
  contenido: Contenido;
};

// y el tipo de los mensajes emitidos por Rabbit sigue el formato del resto del ecommerce
type MensajeRabbit = {
  correlationId: string;
  message: unknown; // Cualquier cosa practicamente
}
```

La entidad principal será el Envío, que poseerá datos sobre las especificaciones de la carga y también su origen y destino. Origen representa la dirección de origen del producto acorde a lo especificado en el mensaje order_placed, y destino la dirección del comprador.

```ts
// Definición de Ids
type EntidadId = Etiquetado<string, "EntidadId">;
type OrdenId = Etiquetado<EntidadId, "OrdenId">;
type UsuarioId = Etiquetado<EntidadId, "UsuarioId">;
type ArticuloId = Etiquetado<EntidadId, "ArticuloId">;
type CarritoId = Etiquetado<EntidadId, "CarritoId">;

// Defino estos tipos porque el orden dentro del arreglo es importante
type Latitud = Etiquetado<number, "Latitud">;
type Longitud = Etiquetado<number, "Longitud">;
type Punto = [Latitud, Longitud];

type Provincia = {
  id: Etiquetado<string, "ProvinciaId">;
  nombre: string;
  // Dato geografico para marcar el limite de la provincia. Usado para calcular el costo
  polilineaLimite: Punto[];
};

type Usuario = {
  usuarioId: UsuarioId;
  nombre: string;
  coordenadas: Punto;
  provincia: Omit<Provincia, "polilineaLimite">;
};

type Articulo = {
  articuloId: ArticuloId;
  nombre: string;
  peso: number;
  largo: number;
  ancho: number;
}

// Entidades
type EstadoEnvio = "PENDIENTE DE DESPACHO" | "EN CAMINO" | "ENTREGADO";
type EspecificacionEnvio = Articulo & {
  cantidad: number;
};

// fyh = Fecha y Hora
// Todos los puntos que ha registrado en cada actualizacion de ubicacion
type RecorridoRealizadoEnvio = (Punto & { fyhUbicacion: Date })[];
type Envio = {
  envioId: Etiquetado<EntidadId, "EnvioId">;
  codigoEnvio: string;
  ordenId: OrdenId;
  usuarioCompradorId: UsuarioId;
  origen: Punto; // Indicado en el mensaje de order_placed
  destino: Punto; // Extraido del usuario comprador
  fyhEstimadaEntrega: Date;
  fyhAlta: Date;
  costo: number;
  especificacion: EspecificacionEnvio;
} & ( // Dependiendo del estado del envío serán las propiedades que tenga
  | {
      estado: "PENDIENTE DE DESPACHO";
    }
  | {
      estado: "EN CAMINO";
      fyhDespacho: Date;
      ubicacionActual: Punto;
      recorrido: RecorridoRealizadoEnvio;
    }
  | {
      estado: "ENTREGADO";
      fyhDespacho: Date;
      fyhEntrega: Date;
      recorrido: RecorridoRealizadoEnvio;
    }
);
```

Y los eventos relacionados a un envío son

```ts
type EventoEnvioCreado = EventoAplicacion<
  "Envio",
  EnvioId,
  "EnvioCreado",
  Envio & { estado: "RETIRO PENDIENTE" }
>;

type EventoEnvioDespachado = EventoAplicacion<
  "Envio",
  EnvioId,
  "EnvioDespachado",
  null
>;

type EventoEnvioUbicacionActualizada = EventoAplicacion<
  "Envio",
  EnvioId,
  "EnvioUbicacionActualizada",
  { fyhUbicacion: Date; ubicacion: Punto }
>;

type EventoEnvioEntregado = EventoAplicacion<
  "Envio",
  EnvioId,
  "EnvioEntregado",
  { fyhEntrega: Date }
>;

type EventoEnvioNoPosible = EventoAplicacion<
  "Order",
  OrderId,
  "EnvioNoPosible",
  { motivo: string }
>;

type EventoEnvioCercanoADestino = EventoAplicacion<
  "Envio",
  EnvioId,
  "EnvioCercanoADestino",
  Envio
>;
```

# Interfaz
## Rest
Los endpoints que requieren jwt y no es enviado en la petición lanzan error 401, y si se envia jwt pero el endpoint requiere otro rol del usuario se lanza error 403. Errores en la validación del cuerpo de la petición, o errores de logica de negocio, se lanza error 400 con un payload para describirlo.

- **Calcular costo de envío**
```ts
POST /envios/calcular // POST para poder enviar body

header: {
  Authorization: "Bearer {jwt}"
}
body: {
  articulos: Pick<EspecificacionEnvio, "articuloId" | "cantidad">[];
  origenEnvio: Punto;
  destinoEnvio: Punto;
}

respuesta: {
  distancia: number,
  costo: number,
  duracionEstimadaMins: number,
}
```

- **Registrar/Actualizar articulo**
Se crea el articulo si no existia (se debe validar con Catalog), o se actualiza si ya estaba (no es necesario validarlo)
```ts
// REGISTRAR
POST /articulos
header: {
  Authorization: "Bearer {jwt}"
}
body: Articulo

// ACTUALIZAR
PATCH /articulos/{articuloId}
header: {
  Authorization: "Bearer {jwt}"
}
body: Omit<Articulo, "articuloId">
```

- **Listar envíos**
Lista todos los envios para administrador, y solo los envios comprados para el usuario cliente.
```ts
GET /envios
headers: {
  Authorization: "Bearer {tokenJWT}"
}

respuesta: Omit<Envio, "recorrido">[]
```

- **Buscar detalles envío**
```ts
GET /envios/{envioId}
headers: {
  Authorization: "Bearer {tokenJWT}"
}

respuesta: Envio
```

- **Actualizar ubicación de envío**
```ts
POST /envios/{envioId}/ubicacion
headers: {-
  Authorization: "Bearer {tokenJWT}" // Autorizado solo administrador
}
body {
  coordenadas: Punto
}

Emite evento EnvioUbicacionActualizada
```

- **Registrar entrega de pedido**
```ts
POST /envios/{envioId}/entrega
headers: {
  Authorization: "Bearer {tokenJWT}" // Autorizado solo administrador
}

Emite evento EnvioEntregado
```

- **Listar provincias:** GET /provincias
```ts
GET /provincias

respuesta: Provincia[]
```

## Rabbit
### Mensajes emitidos
Aquí se detalla la información contenida en la propiedad "message" de los mensajes de Rabbit emitidos por este microservicio. Todos se emiten al direct exchange "direct_delivery"
```ts
// Routing key: envio.creado
type EnvioCreado = Envio;

// Routing key: envio.despachado
type EnvioDespachado = {
  envioId: EnvioId;
  codigoRecepcionCliente: number;
}

// Routing key: envio.ubicacion_actualizada
type EnvioUbicacionActualizada = {
  envioId: EnvioId;
  coordenadas: Punto;
  fyhUbicacion: Date;
}

// Routing key: envio.entregado
type EnvioEntregado = {
  envioId: EnvioId;
  fyhEntrega: Date;
}

// Routing key: envio.cercano_a_destino
type EnvioCercanoADestino = {
  envioId: EnvioId;
  distanciaRestanteKm: number;
  tiempoRestanteAproximadoMin: number;
}

```

### Mensajes consumidos

- **Registrar direccion de nuevo usuario**
Auth debe emitir este evento (será simulado manualmente desde la consola de Rabbit) al momento de registrar un usuario, de forma que el microservicio de delivery almacene el nombre, id, y direccion del usuario.
```ts
Consume mensaje: UserRegistered
UserRegistered: {
  ID: UsuarioId;
  name: string;
  address: Punto;
}
```

- **Crear un envío**
Dado que order no emite el mensaje con el dato de "origenEnvio" se va a simular manualmente el mensaje mediante la consola de Rabbit, luego de haber creado la order.
```ts
Consume mensaje: OrderPlaced
OrderPlaced: {
  ordenId: OrdenId;
  carritoId: CarritoId;
  origenEnvio: Punto;
}

Emite evento "EnvioCreado"
```

- **Logout broadcast**
```ts
Consume mensaje: LogoutBroadcast
LogoutBroadcast: {
	correlationId: string;
	message: string; // token JWT
}
```
