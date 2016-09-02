package toolbox.builder.scalajs.analyzer.generator

import java.io.File

import sbt.io.IO
import toolbox.builder.scalajs.analyzer.model.{JsClass, JsParameter, JsType}
import scala.collection.immutable._

/**
  * Created by pappmar on 02/09/2016.
  */
object SjsGenerator {

  def renderType(jsType: JsType) : String = jsType.rendered

  def generateClass(
    rootDir: File,
    jsClass: JsClass,
    packagePrivate: Boolean,
    overwrite: Boolean
  ) : Unit = {
    val packagePath =
      jsClass.scalaName.toIterable.init

    val packageDir =
      packagePath.foldLeft(rootDir)(new File(_, _))

    packageDir.mkdirs()

    val file = new File(
      packageDir,
      s"${jsClass.scalaName.identifier}.scala"
    )

    if (file.exists() && !overwrite) {
      return
    }

    def paramsString(ps: Iterable[JsParameter]) = {
      val paramsSeq =
        ps
          .map({ p =>
            s"""${p.name}: ${renderType(p.parameterType)}"""
          })

      if (paramsSeq.isEmpty) {
        ""
      } else {
        s"""\n    ${paramsSeq.mkString(",\n    ")}\n  """

      }
    }

    val methods =
      jsClass
        .methods
        .map({ m =>
          val comments = m
            .comments
            .map({ c =>
              s"""  // ${c}"""
            })
            .to[Seq]

          val methodDef = s"""  def ${m.name}(${paramsString(m.parameters)}) : ${renderType(m.returnType)} = js.native"""

          (comments :+ methodDef).mkString("\n")
        })
        .mkString("\n\n")

    val constr =
      if (jsClass.constructorArgs.isEmpty) {
        Seq()
      } else {
        Seq(
          s"""  def this(${paramsString(jsClass.constructorArgs)}) = this()"""
        )
      }

    val internals =
      constr :+ methods

    val superClassString =
      jsClass
        .superClass
        .map({ sc =>
          renderType(sc)
        })
        .getOrElse(
          "js.Object"
        )

    val commentedSuperClassString =
      jsClass
        .superClassComment
        .map({ scc =>
          s"${superClassString} /* ${renderType(scc)} */"
        })
        .getOrElse(superClassString)

    val classModifierString =
      if (packagePrivate)
        s"private [${jsClass.scalaName.parent.get.identifier}] "
      else
        ""

    val comments = jsClass
      .comments
      .map({ c =>
        s"""// ${c}"""
      })
      .to[Seq]

    val lines : Seq[String] =
      Seq(
        s"""package ${packagePath.mkString(".")}
           |
           |import scala.scalajs.js
           |
           |@js.native""".stripMargin
      ) ++
      jsClass.jsName.map({ jsName =>
        s"""@js.annotation.JSName("${jsName.toIterable.mkString(".")}")"""
      }) ++
      comments ++
      Seq(
        s"""${classModifierString}class ${jsClass.scalaName.identifier} extends ${commentedSuperClassString} {
           |${internals.mkString("\n\n")}
           |}
       """.stripMargin

      )

    IO.write(
      file,
      lines.mkString("\n")
    )


  }

}
