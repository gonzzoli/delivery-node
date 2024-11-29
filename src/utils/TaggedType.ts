const tags: unique symbol = Symbol("tags");
/**
 * Un tipo utilitario que sirve para poder permitirle al compilador de Typescript
 * distinguir entre tipos que tienen un mismo tipo primitivo base, pero que
 * conceptualmente queremos indicar que representan cosas distintas y deben distinguirse.
 */
export type Etiquetado<TipoBase, Etiqueta extends PropertyKey> = TipoBase & {
  [tags]: { [K in Etiqueta]: void };
};
