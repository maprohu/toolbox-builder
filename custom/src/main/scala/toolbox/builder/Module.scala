package toolbox.builder

import java.io.File

import _root_.jartree.ClassLoaderKey
import sbt.io.IO

import scala.xml.PrettyPrinter

/**
  * Created by pappmar on 29/08/2016.
  */

//trait Module {
//  def artifactId(contextGroupId: String, place: Option[Pom]) : String
//  def groupId(contextGroupId: String) : String
//  def version : String
//  def classifier : Option[String]
//  def deps: Seq[Module]
//}
//
//
//
//class ExternalModule(
//  val groupId: String,
//  val artifactId: String,
//  val version: String,
//  val classifier: Option[String],
//  val deps: Module*
//) extends Module {
//  override def groupId(contextGroupId: String): String = groupId
//  override def artifactId(contextGroupId: String, place: Option[Pom]): String = artifactId
//}
//
//case class InternalModule(
//  module: NamedModule
//) extends Module {
//  override def groupId(contextGroupId: String): String = contextGroupId
//  override def artifactId(contextGroupId: String, place: Option[Pom]): String = s"${place.get.artifactId(contextGroupId)}-${module.name}"
//  override def version: String = module.version
//  override def classifier: Option[String] = None
//  override def deps: Seq[Module] = module.deps
//}

class Module(
  val groupId: String,
  val artifactId: String,
  val version: String,
  val classifier: Option[String],
  val deps: Seq[Module],
  val provided : Boolean = false
)


//trait ModuleDir {
//  def parent: Option[(ModuleDir, String)]
//}

object Module {
//  implicit def classLoaderKey2Module(clk: ClassLoaderKey) : Module = {
//    new ExternalModule(
//      clk.jar.groupId,
//      clk.jar.artifactId,
//      clk.jar.version,
//      clk.jar.classifier,
//      clk.parents.map(classLoaderKey2Module):_*
//    )
//  }
//
//  implicit def namedModuleToModule(namedModule: NamedModule) : InternalModule = {
//    new InternalModule(
//      namedModule
//    )
//  }
  def provided(module: Module) : Module = new Module(
    module.groupId,
    module.artifactId,
    module.version,
    module.classifier,
    module.deps,
    true
  )
  implicit def classLoaderKey2Module(clk: ClassLoaderKey) : Module = {
    new Module(
      clk.jar.groupId,
      clk.jar.artifactId,
      clk.jar.version,
      clk.jar.classifier,
      clk.parents.map(classLoaderKey2Module)
    )
  }

  implicit def namedModuleToModule(namedModule: NamedModule) : Module = {
    new Module(
      namedModule.container.root.groupId,
      namedModule.path.mkString("-"),
      namedModule.version,
      None,
      namedModule.deps
    )
  }

  def generate(
    roots: Seq[PlacedRoot],
    modules: Seq[NamedModule]
  ) : Unit = {
    val containedContainers =
      modules
        .flatMap(_.container.toContainedSeq)
        .distinct

    val containedModules =
      containedContainers ++ modules


    val childrenMap =
      containedModules
        .groupBy(_.parent)

    val pretty = new PrettyPrinter(300, 4)

    val placeLookup =
      roots
        .map(p => p.rootContainer -> p.rootDir)
        .toMap

    val containerModules =
      modules
        .flatMap(_.container.toSeq)
        .distinct


    containerModules
      .foreach({ place =>
        val dir = place
          .toContainedSeq
          .map(_.name)
          .foldLeft(placeLookup(place.root))(new File(_, _))

        dir.mkdirs()

        val xml =
          <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
            <modelVersion>4.0.0</modelVersion>
            {
              place
                .parentOpt
                .map({ parent =>
                  <parent>
                    <groupId>{place.root.name}</groupId>
                    <artifactId>{parent.artifactId}</artifactId>
                    <version>1.0.0</version>
                  </parent>
                })
                .toSeq
            }

            <groupId>{place.root.name}</groupId>
            <artifactId>{place.artifactId}</artifactId>
            <version>1.0.0</version>
            <packaging>pom</packaging>

            <modules>
              {
                childrenMap
                  .get(place)
                  .toSeq
                  .flatMap({ children =>
                    children.map({ child =>
                      <module>{child.name}</module>
                    })
                  })
              }
            </modules>
          </project>

        IO.write(
          new File(dir, "pom.xml"),
          pretty.format(xml)
        )
      })

    modules
      .foreach({ module =>
        val dir =
          new File(
            module
              .container
              .toContainedSeq
              .map(_.name)
              .foldLeft(placeLookup(module.container.root))(new File(_, _)),
            module.name
          )
        dir.mkdirs()

        val xml =
          <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
            <modelVersion>4.0.0</modelVersion>
            <parent>
              <groupId>{module.container.root.groupId}</groupId>
              <artifactId>{module.container.artifactId}</artifactId>
              <version>1.0.0</version>
            </parent>

            <artifactId>{module.container.artifactId}-{module.name}</artifactId>
            <version>{module.version}</version>
            <packaging>jar</packaging>
            <build>
              <finalName>product</finalName>
              <plugins>
                <plugin>
                  <groupId>net.alchim31.maven</groupId>
                  <artifactId>scala-maven-plugin</artifactId>
                  <version>3.2.1</version>
                  <executions>
                    <execution>
                      <goals>
                        <goal>add-source</goal>
                        <goal>compile</goal>
                        <goal>testCompile</goal>
                      </goals>
                    </execution>
                  </executions>
                </plugin>
                <plugin>
                  <groupId>org.apache.maven.plugins</groupId>
                  <artifactId>maven-compiler-plugin</artifactId>
                  <version>3.5.1</version>
                  <configuration>
                    <source>1.6</source>
                    <target>1.6</target>
                  </configuration>
                </plugin>
                <plugin>
                  <groupId>org.apache.maven.plugins</groupId>
                  <artifactId>maven-source-plugin</artifactId>
                  <version>3.0.1</version>
                  <executions>
                    <execution>
                      <id>attach-sources</id>
                      <phase>package</phase>
                      <goals>
                        <goal>jar</goal>
                      </goals>
                    </execution>
                  </executions>
                </plugin>
                <plugin>
                  <groupId>org.apache.maven.plugins</groupId>
                  <artifactId>maven-dependency-plugin</artifactId>
                  <version>2.10</version>
                </plugin>
              </plugins>
            </build>
            <dependencies>
              {
                module
                  .deps
                  .map({ dep =>
                    <dependency>
                      <groupId>{dep.groupId}</groupId>
                      <artifactId>{dep.artifactId}</artifactId>
                      <version>{dep.version}</version>
                      {dep.classifier.map(c => <classifier>c</classifier>).toSeq}
                      {if (dep.provided) <scope>provided</scope> else Seq()}
                    </dependency>
                  })
              }
            </dependencies>
          </project>

        module.path.foldLeft(new File(dir, "src/main/scala"))(new File(_, _)).mkdirs()

        IO.write(
          new File(dir, "pom.xml"),
          pretty.format(xml)
        )
      })
  }
}

sealed trait ContainedModule {
  def parent: ModuleContainer
  def name : String
}

class NamedModule(
  val container: ModuleContainer,
  val name: String,
  val version: String,
  val deps: Module*
) extends ContainedModule {
  def path : Seq[String] = container.path :+ name
  def parent: ModuleContainer = container
}

class JavaModule(
  name: String,
  version: String,
  deps: Module*
)(implicit
  container: ModuleContainer
) extends NamedModule (
  container,
  name,
  version,
  (deps ++ Seq[Module](
    Module.provided(mvn.`org.scala-lang:scala-library:jar:2.11.8`)
  )):_*
)

class ScalaModule(
  name: String,
  version: String,
  deps: Module*
)(implicit
  container: ModuleContainer
) extends NamedModule (
  container,
  name,
  version,
  (deps ++ Seq[Module](
    mvn.`org.scala-lang:scala-library:jar:2.11.8`
  )):_*
)

class PlacedRoot(
  val rootContainer: RootModuleContainer,
  val rootDir: File
)

object PlacedRoot {
  implicit def fromTuple(
    tuple: (RootModuleContainer, File)
  ) = tuple match {
    case (root, dir) =>
      new PlacedRoot(root, dir)
  }
}
//object NamedModule {
//  def of(
//    name: String,
//    version: String,
//    deps: Module*
//  ): NamedModule = new NamedModule(
//    new Module(version, deps:_*),
//    name,
//    version
//  )
//}

//class PlacedModule(
//  val place: Pom,
//  val module: NamedModule
//) extends ModuleDir {
//  override def parent: Option[(ModuleDir, String)] = Some((place, module.name))
//  def path : Seq[String] = place.path :+ module.name
//}
//
//object PlacedModule {
//  implicit def pairToPlacedModule(pair: (Pom, NamedModule)) : PlacedModule = pair match {
//    case (place, module) =>
//      new PlacedModule(place, module)
//  }
//}


//case class Pom(
//  parent: Option[(Pom, String)] = None
//) extends ModuleDir {
//  def toSeq : Seq[Pom] = {
//    parent
//      .map(_._1.toSeq)
//      .toSeq
//      .flatten :+ this
//  }
//
//  def path : Seq[String] = toSeq.flatMap(_.parent.map(_._2))
//
//  def artifactId(groupId: String) : String = (groupId +: path).mkString("-")
//}
//
//object Pom {
//  def apply(parent: Pom, segment: String) : Pom = Pom(Some((parent, segment)))
//}

trait Artifact {
  def artifactId : String
}

sealed trait ModuleContainer extends Artifact {
  def name : String
  def root : RootModuleContainer
  def path : Seq[String] = toSeq.map(_.name)
  def toSeq : Seq[ModuleContainer]
  def toContainedSeq : Seq[ContainedModule]
  def parentOpt: Option[ModuleContainer]
  def artifactId: String = path.mkString("-")
}

case class RootModuleContainer(
  groupId : String
) extends ModuleContainer {
  def name = groupId
  def root = this
  def toSeq: Seq[ModuleContainer] = Seq(this)
  def toContainedSeq: Seq[ContainedModule] = Seq()
  def parentOpt: Option[ModuleContainer] = None
}

case class SubModuleContainer(
  parent: ModuleContainer,
  name: String
) extends ModuleContainer with ContainedModule {
  def root = parent.root
  def toSeq: Seq[ModuleContainer] = parent.toSeq :+ this
  def toContainedSeq: Seq[ContainedModule] = parent.toContainedSeq :+ this
  def parentOpt: Option[ModuleContainer] = Some(parent)
}

