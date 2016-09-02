package toolbox.builder.scalajs.analyzer.processor

import java.io.File

import sbt.io.IO
import toolbox.builder.scalajs.analyzer.model.QualifiedName

import scala.collection.immutable.Seq
import scala.reflect.runtime.{universe => ru}

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

      cs
        .decls
        .filter(_.isTerm)
        .map(_.asTerm)
        .filter(t => t.isVal || t.isVar)
        .map({ t =>
          (t.name.toString, t.typeSignature.toString)
        })
        .foreach({ t =>
          println(t)
        })

      IO.write(
        targetFile,
        s"""package ${packages.mkString(".")}
           |
           |object ${factoryClassName} {
           |  def apply(
           |  ) : ${className} = scala.scalajs.js.Dynamic.literal(
           |  ).asInstanceOf[${className}]
           |}
         """.stripMargin

      )


    })

  }

}
