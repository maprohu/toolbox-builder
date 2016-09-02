package toolbox.builder.scalajs.custom

import java.io.File

import sandbox8.builder.RunEmsaManaged
import sandbox8.builder.emsamg.OrganizerModules
import toolbox.builder.scalajs.analyzer.RunVisRaw
import visfacade.classes.vis._

import scala.collection.immutable._

/**
  * Created by pappmar on 02/09/2016.
  */
object RunVisCustom {

  val options = Seq(
    classOf[NetworkData],
    classOf[NetworkOptions],
    classOf[NetworkEdgeOptions],
    classOf[NetworkEdgeArrowsOptions],
    classOf[NetworkEdgeArrowHeadOptions],
    classOf[NetworkNodeOptions],
    classOf[DefaultNode],
    classOf[DefaultEdge]
  )

  def main(args: Array[String]): Unit = {
    val targetProject = RunEmsaManaged.projectDir(
      OrganizerModules.Temp
    )

    RunVisRaw.processor.custom(
      new File(targetProject, "target/custom"),
      options
    )
  }

}
