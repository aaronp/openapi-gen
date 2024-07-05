import scala.scalajs.js

object Hello {
  def main(args: Array[String]): Unit = {
    val console = js.Dynamic.global.console
    val msg = "Hello World from Scala.js"
    console.log(msg)
  }
}