package toolbox.builder.toolbox8

import toolbox.builder.{ScalaModule, SubModuleContainer}

/**
  * Created by martonpapp on 31/08/16.
  */
object Akka8Modules {

  implicit val Container = SubModuleContainer(Toolbox8Modules.Root, "akka")


  object Stream extends ScalaModule(
    "stream",
    "1.0.0-SNAPSHOT",
    mvn.`com.typesafe.akka:akka-stream_2.11:2.4.9`
  )

}
