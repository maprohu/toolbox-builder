package toolbox.builder.scalajs.analyzer.jsmodel

import toolbox.builder.scalajs.analyzer.jsmodel.JsModel.LineNumber

import scala.collection.immutable._

object JsModel {
  type LineNumber = Int
}

trait JsProperty {
  def name: String
}

trait JsField extends JsProperty {
}

trait JsObject {
  def fields: Seq[JsField]
  def methods: Iterable[JsFunctionTrait]
}

trait JsParameterTrait {
  def name: String
}

case class JsParameter(
  name: String
) extends JsParameterTrait

trait JsFunctionTrait extends JsProperty {
  def parameters: Iterable[JsParameterTrait]
  def lineNumber : LineNumber
}

case class JsFunction(
  name: String,
  parameters: Seq[JsParameterTrait],
  lineNumber: LineNumber
) extends JsFunctionTrait

trait JsClassTrait extends JsFunctionTrait with JsObject {
}

case class JsClass(
  name: String,
  parameters: Seq[JsParameterTrait],
  fields: Seq[JsField],
  methods: Iterable[JsFunctionTrait],
  lineNumber: LineNumber
) extends JsClassTrait
