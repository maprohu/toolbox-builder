package toolbox.builder.toolbox8

import toolbox.builder.{RootModuleContainer, ScalaModule}

/**
  * Created by martonpapp on 29/08/16.
  */
object Toolbox8Modules {

  implicit val Root = RootModuleContainer("toolbox8")

  object JarTree extends ScalaModule(
    "jartree",
    "1.0.0-SNAPSHOT",
    Akka8Modules.Stream,
    mvn.`jartree:jartree-impl:jar:1.0.0-SNAPSHOT`,
    mvn.`com.typesafe.akka:akka-stream_2.11:2.4.9`,
    mvn.`org.scala-lang.modules:scala-pickling_2.11:jar:0.10.1`,
    mvn.`jartree:jartree-util:jar:1.0.0-SNAPSHOT`,
    mvn.`io.monix:monix_2.11:jar:2.0.0`
  )

//  object Common extends ScalaModule(
//    "common",
//    "1.0.0-SNAPSHOT",
//    mvn.`com.lihaoyi:scalarx_2.11:jar:0.3.1`
//  )

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
