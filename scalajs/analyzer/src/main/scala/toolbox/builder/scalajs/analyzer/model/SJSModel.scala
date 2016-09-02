package toolbox.builder.scalajs.analyzer.model

import toolbox.builder.scalajs.analyzer.model.SJSModel.{Identifier, QualifiedName}

import scala.collection.immutable._

/**
  * Created by martonpapp on 02/09/16.
  */
object SJSModel {

  type Identifier = String
  type QualifiedName = Path


}

case class Path(
  identifier: Identifier,
  parent: Option[Path]
)

case class JsType(

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
  parameters: Seq[JsParameter]
)

trait JsRefType {
  def scalaName: QualifiedName
  def methods: Seq[JsMethod]
  def fields: Seq[JsField]
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
  jsName: QualifiedName,
  superClass: Option[JsSuperClass],
  superTraits: Seq[JsSuperTrait],
  methods: Seq[JsMethod],
  fields: Seq[JsField]
) extends JsRefType


