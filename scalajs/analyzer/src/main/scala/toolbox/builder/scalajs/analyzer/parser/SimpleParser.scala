package toolbox.builder.scalajs.analyzer.parser

import java.io.File

import jdk.nashorn.internal.ir._
import toolbox.builder.scalajs.analyzer.JsParser
import toolbox.builder.scalajs.analyzer.jsmodel._

import scala.collection.immutable._
import scala.reflect.ClassTag
import scala.collection.JavaConversions._


/**
  * Created by pappmar on 02/09/2016.
  */
class SimpleParser(jsFile: File) {
  import SimpleParser._

  val (source, statements) = JsParser.parse(
    jsFile
  )

  def functions : Iterable[JsFunction] = {
    statements.flatMap({ s =>
      parseFunction(s)
    })
  }

  def methods(test: ClassTest) : Iterable[JsFunctionTrait] = {
    statements.flatMap({ s =>
      parseMethod(s, test)
    })
  }

  def classes : Iterable[JsClassTrait] = {
    functions
      .flatMap({ f =>
        val ms = methods(simpleClassTest(f.name))

        if (ms.isEmpty) {
          None
        } else {
          Some(
            JsClass(
              f.name,
              f.parameters,
              fields = Seq(),
              methods = ms,
              lineNumber = f.lineNumber
            )
          )
        }
      })
  }

}

object SimpleParser {

  type ClassTest = Expression => Boolean

  def simpleClassTest(className: String) : ClassTest = { e =>
    val r = for {
      in <- e.cast[IdentNode]
      if in.getName == className
    } yield ()

    r.isDefined
  }

  implicit class CastOps[T <: AnyRef](any: T) {
    def cast[C](implicit tag: ClassTag[C]): Option[C] = {
      tag.unapply(any)
    }
  }

  def parseParameters(functionNode: FunctionNode) = {
    functionNode.getParameters.map({ p =>
      JsParameter(p.getName)
    }).to[Seq]
  }

  def parseFunction(s: Statement): Option[JsFunction] = {
    for {
      varNode <- s.cast[VarNode]
      functionNode <- varNode.getInit.cast[FunctionNode]
    } yield {
      JsFunction(
        name = varNode.getName.getName,
        parameters = parseParameters(functionNode),
        lineNumber = s.getLineNumber
      )
    }
  }

  def parseMethod(s: Statement, test: ClassTest) : Option[JsFunctionTrait] = {
    for {
      es <- s.cast[ExpressionStatement]
      bn <- es.getExpression.cast[BinaryNode]
      fn <- bn.rhs().cast[FunctionNode]
      lan <- bn.lhs().cast[AccessNode]
      methodName = lan.getProperty
      base <- lan.getBase.cast[AccessNode]
      if base.getProperty == "prototype" && test(base.getBase)
    } yield {
      JsFunction(
        name = methodName,
        parameters = parseParameters(fn),
        lineNumber = s.getLineNumber
      )
    }


  }

  def apply(jsFile: File) = {
    new SimpleParser(jsFile)
  }

}
