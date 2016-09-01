package toolbox.builder.portfolio

import java.io.File

import org.eclipse.jgit.api.Git
import org.eclipse.jgit.transport.{NetRCCredentialsProvider, UsernamePasswordCredentialsProvider}
import com.typesafe.config.ConfigFactory
import configs.Configs
import toolbox.builder.scalajs.BuildScalaJs

/**
  * Created by pappmar on 31/08/2016.
  */
object RunDeployPortfolio {

  def main(args: Array[String]): Unit = {

    val FileBaseName = "portfolio"
    val SourceDir = new File("../portfolio")
    val TargetDir = new File("../portfolio-site")

    BuildScalaJs.build(
      TargetDir,
      "My Software Portfolio",
      FileBaseName,
      SourceDir
    )


    val config = ConfigFactory.parseFile(
      new File("../toolbox-builder/credentials.conf")
    )
    val user = Configs[String].get(config, "github.user").value
    val password = Configs[String].get(config, "github.password").value

    val git = Git.open(
      TargetDir
    )

    git.add().addFilepattern(".").call()
    git.commit().setMessage(RunDeployPortfolio.getClass.getName).call()
    git.push().setCredentialsProvider(
      new UsernamePasswordCredentialsProvider(user, password)
    ).call()
  }

}
