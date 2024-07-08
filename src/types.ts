export type Schema = {
  name: string
  version?: string
  fields: Array<Field>
}

export type Field = {
  name: string
  type: 'string' | 'date' | 'email' | 'decimal' | 'int'
  required?: boolean
}
