package toolbox.builder.scalajs.analyzer.processor

import java.io.File

import sandbox8.builder.RunEmsaManaged
import sandbox8.builder.emsamg.OrganizerModules
import toolbox.builder.scalajs.analyzer.generator.SjsGenerator
import toolbox.builder.scalajs.analyzer.jsmodel.JsClassTrait
import toolbox.builder.scalajs.analyzer.model.{QualifiedName, _}
import toolbox.builder.scalajs.analyzer.parser.SimpleParser

import scala.collection.immutable.Seq

/**
  * Created by pappmar on 02/09/2016.
  */
class SimpleProcessor(
  jsPaths: Iterable[(String, Seq[String])],
  sourceRoot: File,
  docRoot: String,
  rootScalaPackage : Seq[String]
) {

  def generateParent(
    generatedDir: File,
    parentQN: QualifiedName,
    superClass: Option[JsType]
  ) : Unit = {
    // parent
    SjsGenerator.generateClass(
      generatedDir,
      JsClass(
        parentQN,
        None,
        superClass = superClass,
        superClassComment = None,
        superTraits = Seq(),
        constructorArgs = Seq(),
        methods = Seq(),
        fields = Seq(),
        comments = Seq()
      ),
      packagePrivate = true,
      overwrite = true
    )

  }

  def raw(
    generatedDir: File,
    customDir: File
  ) = {

    process({ ctx =>
      import ctx._

      // custom
      SjsGenerator.generateClass(
        customDir,
        JsClass(
          customQN,
          None,
          superClass = Some(JsType(parentQN.toDotted)),
          superClassComment = None,
          superTraits = Seq(),
          constructorArgs = Seq(),
          methods = Seq(),
          fields = Seq(),
          comments = Seq()
        ),
        packagePrivate = true,
        overwrite = false
      )

      // parent
      generateParent(
        generatedDir,
        parentQN,
        superClass
      )

      // generated
      SjsGenerator.generateClass(
        generatedDir,
        modelJsClass,
        packagePrivate = false,
        overwrite = true
      )
    })

  }

  def custom(
    generatedDir: File
  ) = {

    process({ ctx =>
      import ctx._

      // parent
      generateParent(
        generatedDir,
        parentQN,
        superClass
      )

      // generated
      SjsGenerator.generateClass(
        generatedDir,
        ReflectiveProcessor.process(
          modelJsClass,
          customQN
        ),
        packagePrivate = false,
        overwrite = true
      )

    })

  }

  def process(proc: ClassContext => Unit) = {
    jsPaths.foreach({
      case (jsPath, targetPackage) =>

        val parser = SimpleParser(
          new File(
            sourceRoot,
            jsPath
          )
        )

        parser.classes.foreach({ c =>
          val ctx = new ClassContext(
            jsPath,
            c,
            targetPackage
          )

          proc(ctx)
        })

    })

  }


  class ClassContext(
    jsPath: String,
    val jsClass: JsClassTrait,
    targetPackage: Seq[String]
  ) {
    val generatedScalaQN =
      QualifiedName(
        rootScalaPackage ++ targetPackage,
        jsClass.name
      )

    val generatedJsQN =
      QualifiedName(
        targetPackage,
        jsClass.name
      )

    val customQN =
      generatedScalaQN.copy(
        identifier = s"${generatedScalaQN.identifier}_Custom"
      )

    val parentQN =
      generatedScalaQN.copy(
        identifier = s"${generatedScalaQN.identifier}_Parent"
      )

    val superClass = None

    val methods =
      jsClass
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
            s"${docRoot}${jsPath}#L${m.lineNumber}"
          )

          JsMethod(
            name = m.name,
            returnType = JsType(),
            parameters = params,
            comments = comments
          )
        })

    val constArgs =
      jsClass
        .parameters
        .map({ p =>
          JsParameter(
            p.name,
            JsType()
          )
        })

    val comments = Seq(
      s"${docRoot}${jsPath}#L${jsClass.lineNumber}"
    )

    val modelJsClass =
      JsClass(
        generatedScalaQN,
        Some(generatedJsQN),
        superClass = Some(JsType(customQN.toDotted)),
        superClassComment = superClass,
        superTraits = Seq(),
        constructorArgs = constArgs,
        methods = methods,
        fields = Seq(),
        comments = comments
      )

  }

}

object SimpleProcessor {

  def apply(
    jsPaths: Iterable[(String, Seq[String])],
    sourceRoot: File,
    docRoot: String,
    rootScalaPackage : Seq[String]
  ) : SimpleProcessor = {
    new SimpleProcessor(
      jsPaths,
      sourceRoot,
      docRoot,
      rootScalaPackage
    )
  }

}
