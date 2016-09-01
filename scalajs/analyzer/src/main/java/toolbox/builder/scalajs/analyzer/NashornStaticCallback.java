package toolbox.builder.scalajs.analyzer;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

/**
 * Created by martonpapp on 01/09/16.
 */
public class NashornStaticCallback {

    public static Object call(NashornCallback cb, ScriptObjectMirror value) {
        return cb.apply(value);
    }
}
