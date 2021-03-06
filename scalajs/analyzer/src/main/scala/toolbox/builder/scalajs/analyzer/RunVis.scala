package toolbox.builder.scalajs.analyzer

import java.io.{File, FileInputStream, InputStreamReader}
import javax.script.{Invocable, ScriptEngineManager}

import jdk.nashorn.api.scripting.ScriptObjectMirror

/**
  * Created by martonpapp on 01/09/16.
  */
object RunVis {

  def main(args: Array[String]): Unit = {
    val RootDir = new File("../toolbox-builder/scalajs/facades/vis/es5")

    val parser = new JsParser

    Seq(
//      ("Graph3d", "index-graph3d"),
//      ("Network", "index-network"),
//      ("TimelineGraph2d", "index-timeline-graph2d")
      ("DataSet", "lib/DataSet")
//      ("DataView", "lib/DataView")
    ).foreach {
      case (name, filebase) =>
        val jsFile = new File(RootDir, s"${filebase}.js").getCanonicalFile

        val (source, stm) = parser.parse(
          jsFile
        )



    }
  }

}
