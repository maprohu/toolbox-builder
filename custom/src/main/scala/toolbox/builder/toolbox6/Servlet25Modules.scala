package toolbox.builder.toolbox6

import toolbox.builder.{JavaModule, Module, ScalaModule, SubModuleContainer}

/**
  * Created by pappmar on 30/08/2016.
  */
object Servlet25Modules {

  implicit val Container = SubModuleContainer(Toolbox6Modules.Root, "servlet25")

  object SingleApi extends JavaModule(
    "singleapi",
    "1.0.0-SNAPSHOT",
    mvn.`javax.servlet:servlet-api:jar:2.5`
  )

  object RunApi extends JavaModule(
    "runapi",
    "1.0.0-SNAPSHOT",
    SingleApi,
    mvn.`javax.servlet:servlet-api:jar:2.5`,
    mvn.`jartree:jartree-api:jar:1.0.0-SNAPSHOT`
  )

  object Webapp extends ScalaModule(
    "webapp",
    "1.0.0-SNAPSHOT",
    SingleApi,
    RunApi,
    Toolbox6Modules.Common,
    mvn.`jartree:jartree-impl:jar:1.0.0-SNAPSHOT`,
    mvn.`com.typesafe.scala-logging:scala-logging_2.11:jar:3.4.0`,
    mvn.`com.lihaoyi:upickle_2.11:jar:0.4.2`,
    mvn.`org.scala-sbt:io_2.11:jar:1.0.0-M6`
  )

  object SampleRunner extends ScalaModule(
    "samplerunner",
    "1.0.0-SNAPSHOT",
    RunApi
  )

}
