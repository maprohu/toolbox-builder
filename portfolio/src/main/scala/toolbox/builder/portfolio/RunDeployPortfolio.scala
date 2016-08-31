package toolbox.builder.portfolio

import java.io.File

import org.eclipse.jgit.api.Git
import org.eclipse.jgit.transport.{NetRCCredentialsProvider, UsernamePasswordCredentialsProvider}
import sbt.io.IO
import com.typesafe.config.ConfigFactory
import configs.Configs

/**
  * Created by pappmar on 31/08/2016.
  */
object RunDeployPortfolio {

  def main(args: Array[String]): Unit = {

    val FileBaseName = "portfolio"

    val DepsFileName = s"${FileBaseName}-jsdeps.min.js"
    val JsFileName = s"${FileBaseName}-opt.js"
    val JsMapFileName = s"${JsFileName}.map"
    val LauncherFileName = s"${FileBaseName}-launcher.js"

    val SourceDir = new File("../portfolio/target/scala-2.11")
    val TargetDir = new File("../portfolio-site")

    val filesToCopy = Seq(
      DepsFileName,
      JsFileName,
      JsMapFileName,
      LauncherFileName
    )

    filesToCopy.foreach({ fn =>
      IO.copyFile(
        new File(SourceDir, fn),
        new File(TargetDir, fn)
      )
    })



    val indexHtml = {
      import scalatags.Text.all._
      html(
        head(
          meta(
            charset := "UTF-8"
          ),
          tag("title")(
            "My Software Portfolio"
          )
        ),
        body(
          script(
            `type` := "text/javascript",
            src := s"./${DepsFileName}"
          ),
          script(
            `type` := "text/javascript",
            src := s"./${JsFileName}"
          ),
          script(
            `type` := "text/javascript",
            src := s"./${LauncherFileName}"
          )
        )
      ).render
    }

    IO.write(
      new File(TargetDir, "index.html"),
      indexHtml
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
