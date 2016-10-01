package toolbox.builder.toolbox6

import toolbox.builder._

/**
  * Created by martonpapp on 29/08/16.
  */
object Toolbox6Modules {

  implicit val Root = RootModuleContainer("toolbox6")

  object Common extends ScalaModule(
    "common",
    "1.0.0-SNAPSHOT",
    mvn.`com.lihaoyi:scalarx_2.11:jar:0.3.1`
  )




//  object JarTree extends ScalaModule(
//    "jartree",
//    "1.0.0-SNAPSHOT",
//    mvn.`commons-io:commons-io:jar:2.5`,
//    mvn.`org.jboss.shrinkwrap.resolver:shrinkwrap-resolver-api:jar:2.2.2`,
//    mvn.`org.jboss.shrinkwrap.resolver:shrinkwrap-resolver-spi:jar:2.2.2`,
//    mvn.`org.jboss.shrinkwrap.resolver:shrinkwrap-resolver-api-maven:jar:2.2.2`,
//    mvn.`org.jboss.shrinkwrap.resolver:shrinkwrap-resolver-spi-maven:jar:2.2.2`,
//    mvn.`org.jboss.shrinkwrap.resolver:shrinkwrap-resolver-impl-maven:jar:2.2.2`,
//    mvn.`org.jboss.shrinkwrap.resolver:shrinkwrap-resolver-impl-maven-archive:jar:2.2.2`
//  )



}

object JarTreeModules {

  implicit val Container = SubModuleContainer(Toolbox6Modules.Root, "jartree")

  object Api extends NamedModule(
    Container,
    "api",
    "1.0.0-SNAPSHOT",
    (mvn.`org.scala-lang:scala-library:jar:2.11.8`:Module).copy(provided = true)
  )

  object Util extends ScalaModule(
    "util",
    "1.0.0-SNAPSHOT",
    Api,
    mvn.`org.jboss.shrinkwrap.resolver:shrinkwrap-resolver-api-maven:jar:2.2.2`
  )

  object Impl extends ScalaModule(
    "impl",
    "1.0.0-SNAPSHOT",
    Api,
    Util,
    mvn.`org.eclipse.aether:aether-util:jar:1.1.0`,
    mvn.`commons-codec:commons-codec:jar:1.10`,
    mvn.`commons-io:commons-io:jar:2.5`
  )

  object ServletApi extends ScalaModule(
    "servletapi",
    "1.0.0-SNAPSHOT",
    mvn.`javax.servlet:servlet-api:jar:2.5`
  )

  object Servlet extends ScalaModule(
    "servlet",
    "1.0.0-SNAPSHOT",
    Impl,
    ServletApi,
    mvn.`io.monix:monix-execution_2.11:jar:2.0.2`,
    mvn.`com.lihaoyi:upickle_2.11:jar:0.4.2`
  )
}
