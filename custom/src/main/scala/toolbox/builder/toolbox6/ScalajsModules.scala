package toolbox.builder.toolbox6

import toolbox.builder.{ScalaModule, SubModuleContainer}

/**
  * Created by pappmar on 02/09/2016.
  */
object ScalajsModules {

  implicit val Container = SubModuleContainer(Toolbox6Modules.Root, "scalajs")

}

object FacadeModules {

  implicit val Container = SubModuleContainer(ScalajsModules.Container, "facades")

}

object VisModules {

  implicit val Container = SubModuleContainer(FacadeModules.Container, "vis")

  object Raw extends ScalaModule(
    "raw",
    "1.0.0-SNAPSHOT",
    mvn.`org.scala-js:scalajs-library_2.11:jar:0.6.12`
  )

}
