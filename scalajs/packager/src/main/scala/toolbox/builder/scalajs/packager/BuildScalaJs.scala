package toolbox.builder.scalajs.packager

import java.io.File

import sbt.io.IO

/**
  * Created by pappmar on 31/08/2016.
  */
object BuildScalaJs {

  def build(
    TargetDir: File,
    Title: String,
    FileBaseName: String,
    SourceProjectDir: File,
    headers: scalatags.Text.Modifier*
  ) : Unit = {


    val DepsFileName = s"${FileBaseName}-jsdeps.min.js"
    val JsFileName = s"${FileBaseName}-opt.js"
    val JsMapFileName = s"${JsFileName}.map"
    val LauncherFileName = s"${FileBaseName}-launcher.js"

    val SourceDir = new File(SourceProjectDir, "target/scala-2.11")

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
            Title
          ),
          headers
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

  }

}
