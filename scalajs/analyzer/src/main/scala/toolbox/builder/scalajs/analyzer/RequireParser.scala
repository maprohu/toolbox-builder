package toolbox.builder.scalajs.analyzer

import java.io.{File, FileInputStream, InputStreamReader}
import javax.script.{Invocable, ScriptEngineManager, SimpleScriptContext}

import jdk.nashorn.api.scripting.ScriptObjectMirror

/**
  * Created by martonpapp on 01/09/16.
  */
object RequireParser {

}

class RequireParser {

  val moduleMap = scala.collection.mutable.Map.empty[File, ScriptObjectMirror]
  val manager = new ScriptEngineManager()

  def run(file: File) : ScriptObjectMirror = {
    val jsFile = file.getCanonicalFile

    val module = moduleMap
      .get(jsFile)
      .getOrElse({
        val fullPath = jsFile.getCanonicalPath
        println(fullPath)
        val engine = manager.getEngineByName("nashorn")
//        val ctx = new SimpleScriptContext
//        engine.setContext(ctx)
        val createFunctionName = "_createCallbackFunction"
        engine.eval(
          s"""function ${createFunctionName}(name, className, firstParam) {
             |  var callbackClass = Java.type(className);
             |  this[name] = function() {
             |    callbackClass.call(firstParam, arguments);
             |  }
             |}
             |
             |exports = {}
             |module = {
             |  exports: exports
             |}
           """.stripMargin
        )

        val value = engine.get("module").asInstanceOf[ScriptObjectMirror]

        moduleMap.update(jsFile, value)

        val cb = new NashornCallback {
          override def apply(value: ScriptObjectMirror): AnyRef = {
            val path = value.getSlot(0).asInstanceOf[String]
            val importFile = new File(jsFile.getParentFile, s"${path}.js")
            run(importFile)
          }
        }

        engine.asInstanceOf[Invocable].invokeFunction(
          createFunctionName,
          "require",
          classOf[NashornStaticCallback].getName,
          cb
        )


        val is = new InputStreamReader(
          new FileInputStream(
            jsFile
          )
        )
        engine.eval(
          is
        )
        is.close()

//        val value = engine.asInstanceOf[Invocable].invokeFunction(
//          returnExportsFunctionName
//        ).asInstanceOf[ScriptObjectMirror]


        value

      })

    module
      .get("exports").asInstanceOf[ScriptObjectMirror]

  }


}
