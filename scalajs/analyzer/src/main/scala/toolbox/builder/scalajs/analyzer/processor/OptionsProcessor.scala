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

  val OptionsValName = "_options_instance_"

  def process(
    generatedDir: File,
    options: Seq[Class[_]]
  ) = {
    options.foreach({ optionsClass =>
      val packages :+ className =
        optionsClass.getName.split('.').to[Seq]

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
          .filter(t => t.isVar)
          .map({ t =>
            (t.name.toString.trim, t.typeSignature.toString, t.typeSignature.erasure == ru.typeOf[js.UndefOr[Any]])
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
            case (name, _, false) =>
              s"    ${OptionsValName}.${name} = ${name}"
            case (name, _, true) =>
              s"    ${name}.foreach( ${OptionsValName}.${name} = _ )"
          })
          .mkString("\n")

      IO.write(
        targetFile,
        s"""package ${packages.mkString(".")}
           |
           |object ${factoryClassName} {
           |  def apply(
           |${args}
           |  ) : ${className} = {
           |    val ${OptionsValName} = scala.scalajs.js.Dynamic.literal().asInstanceOf[${className}]
           |${params}
           |    ${OptionsValName}
           |  }
           |}
         """.stripMargin

      )


    })

  }

}
