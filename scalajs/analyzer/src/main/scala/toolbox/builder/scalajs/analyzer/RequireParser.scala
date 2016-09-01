package toolbox.builder.scalajs.analyzer

import java.io.{File, FileInputStream, InputStreamReader}
import javax.script.{Invocable, ScriptContext, ScriptEngineManager, SimpleScriptContext}

import jdk.nashorn.api.scripting.ScriptObjectMirror

/**
  * Created by martonpapp on 01/09/16.
  */
object RequireParser {

  var RequireDelegateVariableName = "_require_delegate"

}

trait RequireDelegate {
  def require(name: String) : AnyRef
}

class RequireParser {
  import RequireParser._

  val moduleMap = scala.collection.mutable.Map.empty[File, ScriptObjectMirror]
  val manager = new ScriptEngineManager()
  val engine = manager.getEngineByName("nashorn")

  def run(file: File) : ScriptObjectMirror = synchronized {
    val jsFile = file.getCanonicalFile

    val module = moduleMap
      .get(jsFile)
      .getOrElse({
        val fullPath = jsFile.getCanonicalPath
        println(fullPath)
        val ctx = new SimpleScriptContext
        ctx.setAttribute(
          RequireDelegateVariableName,
          new RequireDelegate {
            override def require(path: String): AnyRef = {
              val importFile = new File(jsFile.getParentFile, s"${path}.js")
              run(importFile)
            }
          },
          ScriptContext.ENGINE_SCOPE
        )
        val module = engine.eval(
          s"""function require(path) {
             |  ${RequireDelegateVariableName}.require(path).exports
             |}
             |
             |var exports = {}
             |var module = {
             |  "exports": exports
             |}
             |
             |module
           """.stripMargin,
          ctx
        ).asInstanceOf[ScriptObjectMirror]

        moduleMap.update(jsFile, module)

        val is = new InputStreamReader(
          new FileInputStream(
            jsFile
          )
        )
        engine.eval(
          is,
          ctx
        )
        is.close()

        module
      })

    module

//    module
//      .get("exports").asInstanceOf[ScriptObjectMirror]

  }


}
