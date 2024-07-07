export type Schema = {
  name: string
  fields: Array<Field>
}

export type Field = {
  name: string
  type: 'string' | 'date' | 'email' | 'decimal' | 'int'
  required?: boolean
}
