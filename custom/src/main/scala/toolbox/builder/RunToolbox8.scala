package toolbox.builder

import java.io.File

import toolbox.builder.toolbox8.{Akka8Modules, Common8Modules, Servlet31Modules, Toolbox8Modules}

/**
  * Created by pappmar on 29/08/2016.
  */
object RunToolbox8 {

  val RootDir = new File("../toolbox8")

  val Roots = Seq[PlacedRoot](
    Toolbox8Modules.Root -> RootDir
  )

  val Modules = Seq(
    Toolbox8Modules.JarTree,
    Servlet31Modules.SingleApi,
    Servlet31Modules.RunApi,
    Servlet31Modules.SampleRunner,
    Servlet31Modules.Webapp,
    Akka8Modules.Stream,
    Common8Modules.Tools
  )

  def main(args: Array[String]): Unit = {

    Module.generate(
      Roots,
      Modules
    )

  }

}
