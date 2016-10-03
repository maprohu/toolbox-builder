package toolbox.builder.toolbox8

import toolbox.builder.{JavaModule, ScalaModule, SubModuleContainer}

/**
  * Created by pappmar on 30/08/2016.
  */
object Servlet31Modules {

  implicit val Container = SubModuleContainer(Toolbox8Modules.Root, "servlet31")

  object SingleApi extends JavaModule(
    "singleapi",
    "1.0.0-SNAPSHOT",
    mvn.`javax.servlet:javax.servlet-api:jar:3.1.0`
  )

  object RunApi extends JavaModule(
    "runapi",
    "1.0.0-SNAPSHOT",
    SingleApi,
    mvn.`jartree:jartree-api:jar:1.0.0-SNAPSHOT`
  )

  object Webapp extends ScalaModule(
    "webapp",
    "1.0.0-SNAPSHOT",
    SingleApi,
    RunApi,
//    Toolbox6Modules.Common,
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
