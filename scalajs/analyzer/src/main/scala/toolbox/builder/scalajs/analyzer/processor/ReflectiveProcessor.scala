package toolbox.builder.scalajs.analyzer.processor

import toolbox.builder.scalajs.analyzer.model.{JsClass, JsParameter, JsType, QualifiedName}
import scala.reflect.runtime.{universe => ru}

/**
  * Created by pappmar on 21/07/2016.
  */
object ReflectiveProcessor {

  val mirror = ru.runtimeMirror(getClass.getClassLoader)

  def process(
    generatedClass: JsClass,
    customQN: QualifiedName
  ): JsClass = {
    val extClassName = customQN.toDotted

    val extCls = Class.forName(extClassName)

    val classSymbol = mirror.classSymbol(extCls)
    val cs = classSymbol.typeSignature

    val skipper: String => Boolean = { name =>
      cs.decl(ru.TermName(name)).isTerm
    }

    val ctrParams =
      cs.decls
        .filter(_.isConstructor)
        .map(_.asMethod)
        .map(_.paramLists)
        .filter(_.size == 1)
        .map(_.head)
        .filterNot(_.isEmpty)
        .headOption
        .map(_.map({ v =>
          JsParameter(
            v.name.toString,
            JsType(
              v.typeSignature.toString
            )
          )
        }))
        .getOrElse(generatedClass.constructorArgs)


    generatedClass.copy(
      constructorArgs = ctrParams,
      methods = generatedClass.methods.filterNot(m => skipper(m.name)),
      fields = generatedClass.fields.filterNot(m => skipper(m.name))
    )

  }
}

