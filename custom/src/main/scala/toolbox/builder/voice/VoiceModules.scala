package toolbox.builder.voice

import toolbox.builder.toolbox8.Akka8Modules
import toolbox.builder.{RootModuleContainer, ScalaModule}

/**
  * Created by martonpapp on 29/08/16.
  */
object VoiceModules {

  implicit val Root = RootModuleContainer("voice")

  object Sandbox extends ScalaModule(
    "sandbox",
    "1.0.0-SNAPSHOT",
    Akka8Modules.Stream,
    mvn.`com.typesafe.akka:akka-stream_2.11:jar:2.4.9`,
    mvn.`com.github.wendykierp:JTransforms:jar:3.1`,
    mvn.`org.scala-lang.modules:scala-swing_2.11:jar:2.0.0-M2`,
    mvn.`io.monix:monix_2.11:jar:2.0.2`,
    mvn.`com.badlogicgames.gdx:gdx-backend-lwjgl:jar:1.9.4`,
    mvn.`com.badlogicgames.gdx:gdx-platform:jar:natives-desktop:1.9.4`
  )





}
