//> using dep com.lihaoyi::upickle::3.3.1

import scala.scalajs.js
import upickle.default.*

extension (text : String) {
  def capitalize = if text.isEmpty then text else text.head.toUpper + text.tail.toLowerCase
  def titleCase = text.split(" ").map(_.capitalize).mkString("")
  def camelCase = text.split(" ") match {
    case head +: tail => tail.map(_.capitalize).mkString(head.toLowerCase, "", "")
    case Seq(head) => head
  }
}

case class Data(name: String, subtype: String, fields : Seq[Field] = Nil) derives ReadWriter {
  
  def asOpenApi = {
    s"""paths:
  /data/${name.camelCase}/{id}:
    get:
      summary: Get $name by ID
      description: Retrieve $name by the ID.
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
          description: The $name ID.
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/${name.titleCase}'
        '404':
          description: ${name} not found
components:
  schemas:
    Employee:
      type: object
      properties:
        companyId:
          type: string
        details:
          $ref: '#/components/schemas/Person'
    Person:
      type: object
      properties:
        firstName:
          type: string
        lastName:
          type: string
        age:
          type: integer
          minimum: 19  # Ensuring age is greater than 18
        email:
          type: string
          format: email
          pattern: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}

    """
  }
}

/**
  * Fields types can be in the form:

  {{{
   * reference: #ref:<fileName>
   * primitive: string, email, price, decimal, boolean
   * array: array[<type>]
   * map: map[<type>]
   * optional: <type>?
  
  }}}
  *
  * @param name
  * @param type
  */
case class Field(name: String, `type`: String) derives upickle.default.ReadWriter {
  def resolvedType = FieldType.parse(`type`)
  def asOpenApi = {
    upickle.Obj(name.camelCase -> resolvedType.asOpenApiType)
  
}

enum FieldType:
  case String, Email, Price, Decimal, Boolean
  case Array(itemType : FieldType)
  case Map(itemType : FieldType)
  case Optional(itemType : FieldType)
  case Ref(path: String)
  case Object(data: Data)

  def asOpenApiType : upickle.Value = this match {
    case String => upickle.Obj("type" -> upickle.Str("string"))
    case Email =>
      upickle.Obj(
        "type" -> upickle.Str("string"),
        "format" -> upickle.Str("email"),
        "pattern" -> upickle.Str("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
      )
    case Price => upickle.Obj("type" -> upickle.Str("number"))
    case Decimal => upickle.Obj("type" -> upickle.Str("number"))
    case Boolean => upickle.Obj("type" -> upickle.Str("boolean"))
    case Map(inner) =>
        upickle.Obj("type" -> upickle.Str("object"),
        "additionalProperties" -> upickle.Obj("type" -> inner.asOpenApiType))
    case Optional(inner) =>
    case Array(inner) =>
      upickle.Obj(
        "type" -> upickle.Str("array"),
        "items" -> upickle.Obj("type" -> inner.asOpenApiType)
      )
    case Ref(inner) =>
       upickle.Obj("$ref" -> upickle.Str(s"#/components/schemas/${inner.titleCase}"))
    case Object(inner) =>
      upickle.Obj("$ref" -> upickle.Str(s"#/components/schemas/${inner.name.titleCase}"))
  }

object FieldType:
  def ref(path : String) : FieldType = {
    println("parsing " + path)
    ???
  }
  def parse(field : String) : FieldType = {
    field.trim.toLowerCase match {
      case s"map[${next}]" =>  Map(FieldType.parse(next))
      case s"array[${next}]" =>  Array(FieldType.parse(next))
      case s"${next}?" =>  Optional(FieldType.parse(next))
      case s"#ref:${path}" =>  Optional(FieldType.ref(path))
      case s"#ref:${path}?" =>  Optional(FieldType.ref(path))
      case "string" => FieldType.String
      case "email" => FieldType.Email
      case "price" => FieldType.Price
      case "decimal" => FieldType.Decimal
      case "boolean" => FieldType.Boolean
      case text => 
        sys.error(s"Invalid type '${text}'." )
    }
  }

object Hello {
  def main(args: Array[String]): Unit = {
    val console = js.Dynamic.global.console
    val msg = args.mkString(s"${args.size} args:", ",", "")
    console.log(msg)

    println("-" * 80)

    println(FieldType.parse("map[array[email?]]"))

    val jason = write(Data("foo", "bar", Seq(Field("name", "string"))))
    console.log(jason)
  }
}