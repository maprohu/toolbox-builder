package toolbox.builder.scalajs.analyzer

import java.io.File

import jdk.nashorn.internal.ir.{Block, FunctionNode, Statement}
import jdk.nashorn.internal.parser.Parser
import jdk.nashorn.internal.runtime.options.Options
import jdk.nashorn.internal.runtime.{Context, ErrorManager, Source}

import scala.collection.JavaConversions._
import scala.collection.immutable._

/**
  * Created by pappmar on 21/07/2016.
  */

class JsParser {
  val options: Options = new Options("nashorn")
  options.set("anon.functions", true)
  options.set("parse.only", true)
  options.set("scripting", true)

  val errors: ErrorManager = new ErrorManager
  val context: Context = new Context(options, errors, Thread.currentThread.getContextClassLoader)

  def parse(jsFile: File) : (Source, Iterable[Statement]) = {
    val source: Source = Source.sourceFor(jsFile.getName, jsFile)
    val parser: Parser = new Parser(context.getEnv, source, errors)
    val functionNode: FunctionNode = parser.parse
    val block: Block = functionNode.getBody
    (source, block.getStatements.to[Iterable])
  }
}

object JsParser {

  def parse(jsFile: File) : (Source, Iterable[Statement]) = {
    val parser = new JsParser
    parser.parse(jsFile)
  }

  def parse(files: Iterable[File]) : Iterable[(Source, Statement)]  = {
    val parser = new JsParser

    files.flatMap({ jsFile =>
      val (source, stm) = parser.parse(jsFile)
      stm.map(s => (source, s))
    })
  }

}
