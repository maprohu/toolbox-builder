package toolbox.builder.scalajs.analyzer.processor

import java.io.File

import sbt.io.IO
import toolbox.builder.scalajs.analyzer.model.QualifiedName

import scala.collection.immutable.Seq
import scala.reflect.runtime.{universe => ru}
import scala.scalajs.js

/**
  * Created by pappmar on 02/09/2016.
  */
object OptionsProcessor {

  val mirror = ru.runtimeMirror(getClass.getClassLoader)

  def process(
    generatedDir: File,
    options: Seq[Class[_]]
  ) = {
    options.foreach({ optionsClass =>
      val packages :+ className =
        optionsClass.getName.split('.').to[Seq]

      val qn = QualifiedName(
        packages,
        className
      )

      val targetDir = new File(
        generatedDir,
        packages.mkString("/")
      )

      targetDir.mkdirs()

      val factoryClassName =
        s"${className}Factory"

      val targetFile =
        new File(
          targetDir,
          s"${factoryClassName}.scala"
        )


      val classSymbol = mirror.classSymbol(optionsClass)
      val cs = classSymbol.typeSignature

      val fields =
        cs
          .decls
          .filter(_.isTerm)
          .map(_.asTerm)
          .filter(t => t.isVal || t.isVar)
          .map({ t =>
            (t.name.toString, t.typeSignature.toString, t.typeSignature.erasure == ru.typeOf[js.UndefOr[Any]])
          })

      val args =
        fields
          .map({
            case (name, typ, undef) =>
              s"    ${name}: ${typ}${if (undef) " = scala.scalajs.js.undefined" else ""}"
          })
          .mkString(",\n")

      val params =
        fields
          .map({
            case (name, _, _) =>
              s"    ${name} = ${name}"
          })
          .mkString(",\n")

      IO.write(
        targetFile,
        s"""package ${packages.mkString(".")}
           |
           |object ${factoryClassName} {
           |  def apply(
           |${args}
           |  ) : ${className} = scala.scalajs.js.Dynamic.literal(
           |${params}
           |  ).asInstanceOf[${className}]
           |}
         """.stripMargin

      )


    })

  }

}
