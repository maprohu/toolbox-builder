package toolbox.builder.scalajs.analyzer

import java.io.File

import toolbox.builder.scalajs.analyzer.Sjsa.{JSMethod, MethodCustom, Path}

import scala.collection.immutable._

/**
  * Created by pappmar on 26/07/2016.
  */
trait Specifics {

  def HttpLinkBase : String
  def GeneratedDir : File
  def BasePackage : Path
  def GlobalPackageSegment : Path = Seq("global")
  def GlobalPackage : Path = BasePackage ++ GlobalPackageSegment
  def ClassesPackageSegment : Path =  Seq("classes")
  def ClassesPackage : Path = BasePackage ++ ClassesPackageSegment
  def ScopeTypeName : String = "scope"
  def BaseDir : File
  def jsSourceFiles : Seq[File]
  def methodCustoms : Map[JSMethod, MethodCustom] = Map()
  def packageLinks : Map[Path, Path]
  def skipExt : Boolean = false

}
