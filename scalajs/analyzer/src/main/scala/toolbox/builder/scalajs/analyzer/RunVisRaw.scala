package toolbox.builder.scalajs.analyzer

import java.io.File

import sandbox8.builder.RunEmsaManaged
import sandbox8.builder.emsamg.OrganizerModules
import toolbox.builder.scalajs.analyzer.processor.SimpleProcessor

import scala.collection.immutable._


/**
  * Created by pappmar on 02/09/2016.
  */
object RunVisRaw {

  val DataSetPaths = Seq(
    "lib/DataSet.js",
    "lib/network/Network.js"
  ).map(p => (p, Seq("vis")))

  def main(args: Array[String]): Unit = {

    runRaw(
//      "target/generated-sources"
    )

  }

  def processor = {
    SimpleProcessor(
      jsPaths = DataSetPaths,
      sourceRoot = new File(s"../toolbox-builder/scalajs/facades/vis/es5"),
      docRoot = "https://github.com/maprohu/toolbox-builder/tree/master/scalajs/facades/vis/es5/",
      rootScalaPackage = Seq("visfacade", "classes")
    )
  }

  def runRaw() = {
    val targetProject = RunEmsaManaged.projectDir(
      OrganizerModules.Temp
    )

    processor.raw(
      generatedDir = new File(targetProject, "target/generated-sources"),
      customDir = new File(targetProject, "src/main/scala")
    )
  }


}
