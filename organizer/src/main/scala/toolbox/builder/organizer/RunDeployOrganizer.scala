package toolbox.builder.organizer

import java.io.File

import toolbox.builder.scalajs.packager.BuildScalaJs

/**
  * Created by pappmar on 31/08/2016.
  */
object RunDeployOrganizer {

  def main(args: Array[String]): Unit = {

    val FileBaseName = "organizer"
    val SourceDir = new File("../emsa-managed/organizer")
    val TargetDir = new File("../emsa-managed/organizer/core/src/main/resources/emsamg/organizer/core/html")

    import scalatags.Text.all._
    BuildScalaJs.build(
      TargetDir,
      "Organizer",
      FileBaseName,
      SourceDir,
      link(
        rel := "stylesheet",
        `type` := "text/css",
        href := "vis/dist/vis.min.css"
      )

    )


  }

}
