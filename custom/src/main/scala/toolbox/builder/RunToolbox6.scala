package toolbox.builder

import java.io.File

import toolbox.builder.toolbox6.{Servlet25Modules, Toolbox6Modules}

/**
  * Created by pappmar on 29/08/2016.
  */
object RunToolbox6 {

  val RootDir = new File("../toolbox6")

  val Roots = Seq[PlacedRoot](
    Toolbox6Modules.Root -> RootDir
  )

  val Modules = Seq(
    Toolbox6Modules.Common,
    Servlet25Modules.SingleApi,
    Servlet25Modules.RunApi,
    Servlet25Modules.SampleRunner,
    Servlet25Modules.Webapp
  )

  def main(args: Array[String]): Unit = {

    Module.generate(
      Roots,
      Modules
    )

  }

}
