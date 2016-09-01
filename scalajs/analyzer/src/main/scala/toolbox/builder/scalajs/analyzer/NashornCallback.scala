package toolbox.builder.scalajs.analyzer

import jdk.nashorn.api.scripting.ScriptObjectMirror

/**
  * Created by martonpapp on 01/09/16.
  */
trait NashornCallback {

  def apply(value: ScriptObjectMirror) : AnyRef

}
