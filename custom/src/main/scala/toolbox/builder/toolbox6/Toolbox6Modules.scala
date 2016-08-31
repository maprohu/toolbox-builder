package toolbox.builder.toolbox6

import toolbox.builder.{RootModuleContainer, ScalaModule}

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
