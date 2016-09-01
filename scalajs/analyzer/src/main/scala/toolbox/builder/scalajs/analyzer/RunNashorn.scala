package toolbox.builder.scalajs.analyzer

import javax.script.{ScriptContext, ScriptEngineManager, SimpleScriptContext}

/**
  * Created by martonpapp on 01/09/16.
  */
object RunNashorn {

  trait X {
    def y() : Unit = {
      println("heheh")
    }

  }

  def main(args: Array[String]): Unit = {
    val engine = new ScriptEngineManager().getEngineByName("nashorn")

    val ctx1 = new SimpleScriptContext
    ctx1.setAttribute("hehe", new X {}, ScriptContext.ENGINE_SCOPE)
//    ctx1.setBindings(engine.getBindings(ScriptContext.GLOBAL_SCOPE), ScriptContext.GLOBAL_SCOPE)



    val boo = engine.eval(
      """
        |hehe.y()
        |
        |boo = { x: 5 }
        |
        |boo
      """.stripMargin,
      ctx1
    )

    println(boo)


    val ctx2 = new SimpleScriptContext
//    ctx1.setBindings(engine.getBindings(ScriptContext.GLOBAL_SCOPE), ScriptContext.GLOBAL_SCOPE)

    engine.eval(
      """
        |print(boo.x)
      """.stripMargin,
      ctx1
    )
  }

}
