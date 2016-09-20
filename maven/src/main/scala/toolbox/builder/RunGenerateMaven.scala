package toolbox.builder

import java.io.File
import java.net.URLEncoder

import org.jboss.shrinkwrap.resolver.api.maven.{Maven, ScopeType}
import sbt.io.IO

/**
  * Created by martonpapp on 28/08/16.
  */
object RunGenerateMaven {

  val artifacts = Seq(
    //    "org.jboss.shrinkwrap.resolver:shrinkwrap-resolver-api:jar:2.2.2",
    //    "org.jboss.shrinkwrap.resolver:shrinkwrap-resolver-spi:jar:2.2.2",
    //    "org.jboss.shrinkwrap.resolver:shrinkwrap-resolver-api-maven:jar:2.2.2",
    //    "org.jboss.shrinkwrap.resolver:shrinkwrap-resolver-spi-maven:jar:2.2.2",
    //    "org.jboss.shrinkwrap.resolver:shrinkwrap-resolver-impl-maven:jar:2.2.2",
    //    "org.jboss.shrinkwrap.resolver:shrinkwrap-resolver-impl-maven-archive:jar:2.2.2",
    "com.typesafe.akka:akka-stream_2.11:2.4.9",
    "javax.servlet:servlet-api:jar:2.5",
    "javax.servlet:javax.servlet-api:jar:3.1.0",
    "org.scala-lang:scala-library:jar:2.11.8",
    "com.lihaoyi:scalarx_2.11:jar:0.3.1",
    "commons-io:commons-io:jar:2.5",
    "commons-codec:commons-codec:jar:1.10",
    "jartree:jartree-api:jar:1.0.0-SNAPSHOT",
    "jartree:jartree-impl:jar:1.0.0-SNAPSHOT",
    "org.slf4j:slf4j-api:jar:1.7.21",
    "com.typesafe.scala-logging:scala-logging_2.11:jar:3.4.0",
    "com.typesafe.akka:akka-stream-experimental_2.11:jar:2.0.4",
    "com.lihaoyi:upickle_2.11:jar:0.4.2",
    "org.scala-sbt:io_2.11:jar:1.0.0-M6",
    "com.jsuereth:scala-arm_2.11:jar:1.4",
    "org.scala-lang.modules:scala-pickling_2.11:jar:0.10.1",
    "com.typesafe.akka:akka-http-experimental_2.11:jar:2.4.9",
    "org.webjars.bower:vis:jar:4.16.1",
    "org.scala-js:scalajs-library_2.11:jar:0.6.12",
    "org.scala-js:scalajs-dom_sjs0.6_2.11:jar:0.9.1",
    "com.github.wendykierp:JTransforms:jar:3.1",
    "org.scala-lang.modules:scala-swing_2.11:jar:2.0.0-M2",
    "io.monix:monix_2.11:jar:2.0.0",
    "de.heikoseeberger:akka-http-json4s_2.11:jar:1.9.0",
    "org.json4s:json4s-native_2.11:jar:3.4.0",
    "emsa:wupdata-common-shared:jar:1.0.4-SNAPSHOT",
    "emsa:wupdata-core:jar:1.0.5-SNAPSHOT",
    "com.github.nscala-time:nscala-time_2.11:jar:2.12.0",
    "io.github.lukehutch:fast-classpath-scanner:jar:2.0.3"
  )

  val root = new File("../maven-modules/src/main/scala/mvn")

  def process(canonical: String) : Unit = {
    val resolveds =
      Maven
        .resolver()
        .resolve(canonical)
        .withTransitivity()
        .asResolvedArtifact()
        .toSeq


    val resolved +: resolvedDeps = resolveds

    val dir = new File(
      root,
      s"${resolved.getCoordinate.getGroupId.replace('.', '/')}"
    )
    dir.mkdirs()

    val fileName = s"${URLEncoder.encode(canonical, "UTF-8")}.scala"
    val file = new File(dir, fileName)

    val deps = resolvedDeps.filter(d => d.getScope != ScopeType.TEST && !d.isOptional)

    if (!file.exists()) {

      val content =
        s"""
           |package mvn
           |
           |object `${canonical}` extends _root_.jartree.util.CaseClassLoaderKey(
           |  jar = _root_.jartree.util.MavenJarKeyImpl("${canonical}"),
           |  dependenciesSeq = collection.immutable.Seq(
           |    ${deps.map(d => s"`${d.getCoordinate.toCanonicalForm}`").mkString(",\n    ")}
           |  )
           |)
         """.stripMargin

      IO.write(
        file,
        content
      )

    }

    deps.foreach { dep =>
      process(dep.getCoordinate.toCanonicalForm)
    }


  }

  def main(args: Array[String]): Unit = {
    root.mkdirs()
    IO.delete(root)
    root.mkdirs()




    artifacts.foreach({ canonical =>
      process(canonical)
    })

  }

}
