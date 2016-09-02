package toolbox.builder.scalajs.analyzer.model

import toolbox.builder.scalajs.analyzer.model.SJSModel.{Comment, Identifier}

import scala.collection.immutable._

/**
  * Created by martonpapp on 02/09/16.
  */
object SJSModel {

  type Identifier = String
  type Comment = String

}

case class QualifiedName(
  identifier: Identifier,
  parent: Option[QualifiedName]
) {
  def toIterable : Iterable[Identifier] = parent.to[Seq].flatMap(_.toIterable) :+ identifier
  def toDotted = toIterable.mkString(".")
}

object QualifiedName {

  def apply(seq: Iterable[Identifier], last: Identifier) : QualifiedName = {
    QualifiedName(
      last,
      if (seq.isEmpty) {
        None
      } else {
        Some(
          QualifiedName(
            seq.init,
            seq.last
          )
        )
      }
    )
  }

}




case class JsType(
  rendered: String = "js.Any"
)

case class JsParameter(
  name: Identifier,
  parameterType: JsType
)

case class JsField(
  name: Identifier,
  fieldType: JsType
)

case class JsMethod(
  name: String,
  returnType: JsType,
  parameters: Iterable[JsParameter],
  comments: Iterable[Comment]
)

trait JsRefType {
  def scalaName: QualifiedName
  def methods: Iterable[JsMethod]
  def fields: Iterable[JsField]
}



case class JsTrait(
  scalaName: QualifiedName,
  superTraits: Seq[JsSuperTrait],
  methods: Seq[JsMethod],
  fields: Seq[JsField]
) extends JsRefType

trait JsSuperClass
trait JsSuperTrait

case class JsClass(
  scalaName: QualifiedName,
  jsName: Option[QualifiedName],
  superClass: Option[JsType],
  superClassComment: Option[JsType],
  superTraits: Seq[JsType],
  constructorArgs: Iterable[JsParameter],
  methods: Iterable[JsMethod],
  fields: Seq[JsField],
  comments: Iterable[Comment]
) extends JsRefType


