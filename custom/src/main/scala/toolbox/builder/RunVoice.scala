package toolbox.builder

import java.io.File

import toolbox.builder.voice.VoiceModules

/**
  * Created by pappmar on 29/08/2016.
  */
object RunVoice {

  val RootDir = new File("../voice")

  val Roots = Seq[PlacedRoot](
    VoiceModules.Root -> RootDir
  )

  val Modules = Seq(
    VoiceModules.Sandbox
  )

  def main(args: Array[String]): Unit = {

    Module.generate(
      Roots,
      Modules
    )

  }

  def projectDir(module: ModuleContainer) : File = {
    module.path.tail.foldLeft(RootDir)(new File(_, _))
  }

  def projectDir(module: NamedModule) : File = {
    new File(projectDir(module.container), module.name)
  }


}
