package toolbox.builder.scalajs.analyzer

import java.io.File

import sandbox8.builder.RunEmsaManaged
import sandbox8.builder.emsamg.OrganizerModules
import toolbox.builder.RunToolbox6
import toolbox.builder.scalajs.analyzer.generator.SjsGenerator
import toolbox.builder.scalajs.analyzer.model._
import toolbox.builder.scalajs.analyzer.parser.SimpleParser
import toolbox.builder.toolbox6.VisModules

import scala.collection.immutable._

/**
  * Created by pappmar on 02/09/2016.
  */
object RunTestVis {

  def main(args: Array[String]): Unit = {

    val jsPath = "lib/DataSet.js"
    val parser = SimpleParser(
      new File(
        s"../toolbox-builder/scalajs/facades/vis/es5/${jsPath}"
      )
    )

    parser.classes.foreach({ c =>
      val qn =
        QualifiedName(
          Seq("visfacade", "classes", "vis"),
          c.name
        )

      val jsqn =
        QualifiedName(
          Seq("vis"),
          c.name
        )

      val methods =
        c
          .methods
          .map({ m =>
            val params =
              m
                .parameters
                .map({ p =>
                  JsParameter(
                    p.name,
                    JsType()
                  )
                })

            val comments = Seq(
              s"https://github.com/maprohu/toolbox-builder/tree/master/scalajs/facades/vis/es5/${jsPath}#L${m.lineNumber}"
            )

            JsMethod(
              name = m.name,
              returnType = JsType(),
              parameters = params,
              comments = comments
            )
          })

      val constArgs =
        c
          .parameters
          .map({ p =>
            JsParameter(
              p.name,
              JsType()
            )
          })

      val targetProjectDir =
        RunEmsaManaged.projectDir(
          OrganizerModules.Temp
        )

      val customDir =
        new File(
          targetProjectDir,
          "src/main/scala"
        )

      val superQN =
        qn.copy(
          identifier = s"${qn.identifier}_Custom"
        )

      val superClass = None

      SjsGenerator.generateClass(
        customDir,
        JsClass(
          superQN,
          None,
          superClass = superClass,
          superClassComment = None,
          superTraits = Seq(),
          constructorArgs = Seq(),
          methods = Seq(),
          fields = Seq(),
          comments = Seq()
        ),
        false
      )

      SjsGenerator.generateClass(
        new File(
          targetProjectDir,
          "target/generated-sources"
        ),
        JsClass(
          qn,
          Some(jsqn),
          superClass = Some(JsType(superQN.toDotted)),
          superClassComment = superClass,
          superTraits = Seq(),
          constructorArgs = constArgs,
          methods = methods,
          fields = Seq(),
          comments = Seq()
        ),
        true
      )
    })
  }

}
