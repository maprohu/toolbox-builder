package toolbox.builder.scalajs.analyzer

import java.io.File
import java.lang.reflect.{ParameterizedType, Type}

import jdk.nashorn.internal.ir._
import jdk.nashorn.internal.parser.TokenType
import jdk.nashorn.internal.runtime.Source
import sbt.io.IO
import sbt.io.Path._

import scala.collection.JavaConversions._
import scala.collection.immutable._
import scala.reflect.ClassTag
import scala.reflect.runtime.{universe => ru}
import scala.scalajs.js
import scala.util.Try

/**
  * Created by pappmar on 21/07/2016.
  */
object Sjsa {
  type Path = Seq[String]
  type Skipper = String => Boolean
  type Ctr = FunctionNode => Seq[String]

  val mirror = ru.runtimeMirror(getClass.getClassLoader)

  case class JSClass(
    name: String,
    pkg: Path
//    packagePath : Path,
//    typeName: String

  ) {
    def fullName = (pkg :+ name).mkString(".")
//    def packagePath : Path =
//      GlobalPackageSegment ++ pkg ++ ClassesPackageSegment

//    def path : Path =
//      packagePath :+ name

//    def typeName = (BasePackage ++ path).mkString(".")
  }
  object JSClass {
    def unapply(path: Path) : Option[JSClass] = {
      path.toJSClass
    }

    def unapply(accessNode: AccessNode) : Option[JSClass] = {
      if (accessNode.getProperty.head.isUpper) {
        accessNode.toPath.map({ p =>
          JSClass(accessNode.getProperty, p.init)
        })
      } else {
        None
      }
    }

  }
  case class JSClassDef(
    cls: JSClass,
    functionNode: FunctionNode
  )
  case class JSMethod(
    name: String,
    cls: JSClass
  )
  case class JSVarDef(
    name: String,
    source: Source,
    statement: Statement
  )
  case class JSMethodDef(
    method: JSMethod,
    functionNode: FunctionNode
  )

  case class ScopeAssignment(
    lhs: Path,
    rhs: Expression,
    source: Source,
    statement: Statement
  )

  case class StaticMemberAssignment(
    scope: Path,
    name: String,
    rhs: Expression,
    source: Source,
    statement: Statement
  )

  case class FunctionAssignment(
    lhs: Path,
    functionNode: FunctionNode
  )

  object Path {
    def unapply(accessNode: AccessNode) : Option[Path] = {
      accessNode.toPath
    }
  }

  implicit class CastOps[T <: AnyRef](any: T) {
    def cast[C](implicit tag: ClassTag[C]) : Option[C] = {
      tag.unapply(any)
    }

  }

  implicit class AccessNodeOps(accessNode: AccessNode) {

    def toPath : Option[Path] = {

      accessNode.getBase match {
        case an : AccessNode =>
          an.toPath.map(_ :+ accessNode.getProperty)
        case in : IdentNode =>
          Some(Seq(in.getName, accessNode.getProperty))
        case _ => None
      }

    }

  }

  implicit class PathOps(path: Path) {

    def toJSClass : Option[JSClass] = {
      path.reverse match {
        case (name +: pkgRev) if name.head.isUpper =>
          Some(JSClass(name, pkgRev.reverse))
        case _ => None
      }
    }

    def toPathString = {
      path.mkString(".")
    }

  }

//  def main(args: Array[String]): Unit = {
//    generateClasses
//  }


  case class MethodCustom(
    skip: Boolean = false,
    over: Option[Boolean] = None
  )

  implicit class PackageOps(pkg: Package) {
    def toPath : Path = {
      pkg.getName.split('.').to[Seq]
    }
  }

  implicit class ClassOps(cls: Class[_]) {
    def toPath : Path = cls.getName.split('.').to[Seq]
  }




  def printType(t: Type) : String = {
    t match {
      case c : Class[_] =>
        ClassTag(c).toString()
      case p : ParameterizedType =>
        s"${printType(p.getRawType)}[${p.getActualTypeArguments.map(printType).mkString(",")}]"

    }
  }

  implicit class StringOps(str: String) {
    def quoted : String = {
      str match {
        case "type" =>
          s"`${str}`"
        case _ =>
          str
      }
    }

  }

}

class Generator(specifics: Specifics) {
  import Sjsa._
  import specifics._

  val statements =
    JsParser
      .parse(jsSourceFiles)

  val assignments =
    statements
      .collect({
        case (source, s : ExpressionStatement) =>
          s.getExpression match {
            case b : BinaryNode if b.tokenType() == TokenType.ASSIGN =>
              b.lhs() match {
                case an : AccessNode =>
                  an.toPath.map(p => ScopeAssignment(
                    p,
                    b.rhs(),
                    source,
                    s
                  ))
                case _ =>
                  None
              }

            case _ =>
              None
          }

      })
      .flatten

  val functionAssignments =
    assignments
      .collect({
        case ScopeAssignment(an, fn: FunctionNode, so, st) =>
          FunctionAssignment(an, fn)
      })

  val classes1 : Iterable[JSClassDef] =
    functionAssignments
      .flatMap({ fa =>
        fa.lhs match {
          case (pkg :+ className) if className.head.isUpper =>
            Some(
              JSClassDef(
                JSClass(
                  name = className,
                  pkg = pkg
                ),
                functionNode = fa.functionNode
              )
            )
          case _ => None
        }
      })


  case class Inheritance(
    superClass: JSClass,
    subClass: JSClass
  )

  val definedClasses =
    classes1
      .map(_.cls)
      .toSet

  val inheritances =
    classes1
      .map({ c =>

        def fromCallNode(cn: CallNode) = {
          for {
            an <- cn.getFunction.cast[AccessNode]
            (superPath :+ "call") <- an.toPath
            superClass <- superPath.toJSClass
          } yield {
            superClass
          }
        }

        def fromBinaryNode(bn: BinaryNode) : Option[JSClass] = {
          bn.lhs() match {
            case cn : CallNode =>
              fromCallNode(cn)
            case bn2: BinaryNode =>
              fromBinaryNode(bn2)
            case _ =>
              None
          }
        }

        def fromBlock(block: Block) : Option[JSClass] = {
          fromStatements(block.getStatements.toList)
        }

        def fromStatements(statements: List[Statement]) : Option[JSClass] = {
          for {
            firstStatement <- statements.headOption
            superClass <- firstStatement match {
              case es : ExpressionStatement =>
                es.getExpression match {
                  case cn: CallNode =>
                    fromCallNode(cn)
                  case bn : BinaryNode if bn.tokenType() == TokenType.AND =>
                    for {
                      jps <- bn.rhs().cast[JoinPredecessorExpression]
                      bn2 <- jps.getExpression.cast[BinaryNode]
                      sc <- fromBinaryNode(bn2)
                    } yield {
                      sc
                    }
                  case _ =>
                    None
                }
              case in : IfNode =>
                fromBlock(in.getPass)
                  .orElse(fromStatements(statements.tail))
              case _ =>
                None
            }
          } yield {
            superClass
          }
        }


        val sc =
          fromBlock(c.functionNode.getBody)
          .getOrElse(
            classOf[js.Object].toPath.toJSClass.get
          )

        Inheritance(
          superClass = sc,
          subClass = c.cls
        )
      })



  //    val classNames = classes1.map(_.accessNode.toString()).toSet
  //
  //    val innerClasses =
  //      classes1
  //        .filter({ c =>
  //          classNames.contains(c.accessNode.getBase.toString)
  //        })
  //
  //    innerClasses.foreach(println)



  val staticAssignments =
    assignments
      .filterNot(_.lhs contains "prototype")

  val scopes =
    staticAssignments.flatMap(a =>
      a.lhs.init.inits.map(p => p -> Seq.empty[ScopeAssignment])
    )
    .toMap
    .++(
      staticAssignments
        .groupBy(_.lhs.init)
    )

  val innerScopes =
    scopes
      .to[Seq]
      .filterNot(_._1.isEmpty)
      .groupBy(_._1.init)
      .withDefaultValue(Nil)

  val staticMemberAssignments =
    staticAssignments
      .filterNot(a => scopes.contains(a.lhs))
      .map(a =>
        StaticMemberAssignment(
          a.lhs.init,
          a.lhs.last,
          a.rhs,
          a.source,
          a.statement
        )
      )
      .groupBy(_.scope)
      .mapValues(_.groupBy(_.name))
      .withDefaultValue(Nil)

  def innerScopesSource(pkg: Path) = {
    innerScopes(pkg)
      .map(_._1.last)
      .map(name => s"""  val ${name} : ${((GlobalPackage ++ pkg) :+ name :+ ScopeTypeName).mkString(".")} = js.native""")
      .mkString("\n")
  }

  def staticMembersSource(pkg: Path, skipper: Skipper) = {
    staticMemberAssignments(pkg)
      .filterNot(c => skipper(c._1))
      .map({
        case (name, as) =>
          val links = as
            .map({ a =>
              s"  // ${createHyperlink(a.source, a.statement.getLineNumber)}\n"
            }).mkString


          s"""${links}  var ${name} : js.Any = js.native
             """.stripMargin
      })
      .mkString("\n")
  }


  val methods =
    functionAssignments
      .flatMap({ fa =>
        fa.lhs match {
          case (pkg :+ className :+ "prototype" :+ methodName) =>
            Some(
              JSMethodDef(
                JSMethod(
                  name = methodName,
                  cls = JSClass(
                    name = className,
                    pkg = pkg
                  )
                ),
                functionNode = fa.functionNode
              )
            )
          case _ => None
        }
      })

  def extractVars(ex: Expression) : Iterable[String] = {
    ex match {
      case b : BinaryNode =>

        val assignVar =
          for {
            ba <- Seq(b)
            if (ba.tokenType() == TokenType.ASSIGN)
            an <- b.lhs().cast[AccessNode]
            in <- an.getBase.cast[IdentNode]
            if in.getPropertyName == "this"
          } yield {
            an.getProperty
          }

        assignVar ++ extractVars(b.lhs()) ++ extractVars(b.rhs())
      case jpe : JoinPredecessorExpression =>
        extractVars(jpe.getExpression)
      case _ =>
        Nil
    }
  }

  def extractVars(stm: Seq[Statement]) : Iterable[(String, Statement)] =
    stm.flatMap({
      case ex : ExpressionStatement =>
        extractVars(ex.getExpression).map(v => (v, ex))
      case in: IfNode =>
        extractVars(in.getTest).map(v => (v, in)) ++
          extractVars(in.getPass.getStatements.to[Seq]) ++
          Option(in.getFail).toSeq.flatMap(b => extractVars(b.getStatements.to[Seq]))
      case _ =>
        Nil
    })

  val varsByClass : Map[JSClass, Map[String, Iterable[JSVarDef]]] =
    (for {
      (cls, fn) <-
      classes1
        .map(c => (c.cls, c.functionNode))
        .++(methods.map(m => (m.method.cls, m.functionNode)))
      (name, es) <- extractVars(fn.getBody.getStatements.to[Seq])
    } yield {
      (
        cls,
        name,
        JSVarDef(
          name,
          fn.getSource,
          es
        )
        )
    })
      .groupBy(_._1)
      .mapValues({ vs =>
        vs
          .groupBy(_._2)
          .mapValues(_.map(_._3))
      })
      .withDefaultValue(Map())


  val methodsByClass : Map[JSClass,Map[String, JSMethodDef]] = {
    methods
      .groupBy(_.method.cls)
      .mapValues(_.map(md => (md.method.name, md)).toMap)
      .withDefaultValue(Map())
  }


  val superMap : Map[JSClass, JSClass] = {
    inheritances.map(i => (i.subClass, i.superClass)).toMap
  }

  val subMap : Map[JSClass, Iterable[JSClass]] = {
    inheritances
      .groupBy(_.superClass)
      .mapValues(_.map(_.subClass))
      .withDefaultValue(Iterable())
  }

  def superChain(cls: JSClass) : Stream[JSClass] = {
    cls +:
      (superMap.get(cls)
        .map(sup => superChain(sup))
        .getOrElse(Stream()))
  }

  def subChain(cls: JSClass) : Stream[JSClass] = {
    cls +:
      (subMap(cls)
        .toStream
        .flatMap({ sub =>
          subChain(sub)
        }))
  }

  implicit class JSClassOpt(cls: JSClass) {
    def packagePath : Path =
      GlobalPackageSegment ++ cls.pkg ++ ClassesPackageSegment

    def path : Path =
      packagePath :+ cls.name

    def typeName = (BasePackage ++ path).mkString(".")
  }

  trait ParamInfo {
    def name: String
    def typeName: String
  }

  trait MethodInfo {
    def declaringClass : ClassInfo
    def params: Seq[ParamInfo]
    def returnType: String
  }

  trait VarInfo {
    def declaringClass : ClassInfo
    def name: String
    def typeName: String
    def defs : Iterable[JSVarDef]
  }


  trait ClassInfo {
    def name: String
    def superClass : Option[ClassInfo]
    def methods : Map[String, MethodInfo]
    def vars : Map[String, VarInfo]
  }

  case class JSClassInfo(
    cls: JSClass
  ) extends ClassInfo {
    self =>

    override def name: String = {
      cls.typeName
    }

    val ms =
      methodsByClass(cls)
        .mapValues({ m =>
          val paramCount =
            subChain(cls)
              .flatMap({ c =>
                methodsByClass(c)
                  .get(m.method.name)
                  .map(_.functionNode.getParameters.size())
              })
              .max

          new MethodInfo {
            override def declaringClass: ClassInfo = self
            override def params: Seq[ParamInfo] = {
              Range.inclusive(1, paramCount).map(id =>
                new ParamInfo {
                  override def typeName: String = "js.Any"
                  override def name: String = s"param${id}"
                }
              )
            }
            override def returnType: String = "js.Any"
          }
        })


    override def methods: Map[String, MethodInfo] = ms

    override def superClass: Option[ClassInfo] = {
      Some(
        classInfo(superMap(cls))
      )
    }

    override def vars: Map[String, VarInfo] = {
      varsByClass(cls)
        .map({
          case (n, vs) =>
            (
              n,
              new VarInfo {
                override def defs: Iterable[JSVarDef] = vs

                override def declaringClass: ClassInfo = self

                override def typeName: String = "js.Any"

                override def name: String = n
              }
              )
        })
    }
  }

  case class ReflectClassInfo(
    cls: Class[_]
  ) extends ClassInfo {
    self =>

    val cs = mirror.classSymbol(cls).typeSignature

    override def name: String = cls.getName

    override def methods: Map[String, MethodInfo] = {
      cls
        .getMethods
        .flatMap({ m =>
          cs.decl(ru.TermName(m.getName)).alternatives.headOption.map(_.asMethod)
        })
        .map({ csm =>
          csm.name.toString -> new MethodInfo {
            override def declaringClass: ClassInfo = self
            override def params: Seq[ParamInfo] = csm.paramLists(0).map({ p =>
              new ParamInfo {
                override def typeName: String = p.typeSignature.toString
                override def name: String = p.name.toString
              }
            })

            override def returnType: String = csm.returnType.toString
          }
        })
        .toMap
    }

    override def superClass: Option[ClassInfo] = {
      Option(cls.getSuperclass).map(ReflectClassInfo)
    }

    override def vars: Map[String, VarInfo] =
      cs.decls.map(f =>
        (
          f.name.toString,
          new VarInfo {
            override def defs: Iterable[JSVarDef] = ???

            override def declaringClass: ClassInfo = self

            override def typeName: String = ???

            override def name: String = ???
          }
          )
      )
        .toMap
  }

  def classInfo(cls: JSClass) : ClassInfo = {
    if (definedClasses.contains(cls)) {
      JSClassInfo(cls)
    } else {
      ReflectClassInfo(
        reflectClass(cls)
      )
    }
  }

  def reflectClass(cls: JSClass) : Class[_] = {
    cls.pkg.inits
      .find({ p =>
        packageLinks.contains(p)
      })
      .map({ p =>
        Class.forName((packageLinks(p) ++ (cls.pkg.drop(p.size)) :+ cls.name).toPathString)
      })
      .getOrElse(
        classOf[js.Object]
      )
  }

  def generateClasses = {

    IO.delete(GeneratedDir)
    GeneratedDir.mkdirs()

    def methodCustomsGet(m: JSMethod) = {
      methodCustoms get m
    }

    def superChainInfo(cls: ClassInfo) : Stream[ClassInfo] = {
      cls +:
        (cls.superClass
          .map(sup => superChainInfo(sup))
          .getOrElse(Stream()))
    }

    def classVarsSource(cls: JSClass, skipper: String => Boolean) : String = {
      varsByClass(cls)
        .filterNot(c => skipper(c._1))
        .to[Seq]
        .sortBy(_._1)
        .flatMap({
          case (name, vds) =>

            val info = classInfo(cls)

            val top =
              superChainInfo(info)
                .reverse
                .flatMap(_.vars.get(name))
                .head

            if (top.declaringClass == info) {
              val links =
                vds.map({ vd =>
                  s"  // ${createHyperlink(vd.source, vd.statement.getLineNumber)}"
                })
                  .mkString("\n")


              Some(
                s"""${links}
                   |  val ${name.quoted} : js.Any = js.native
                   |""".stripMargin
              )
            } else {
              None
            }

        })
        .mkString("\n")

    }

    def classMethodsSource(cls: JSClass, skipper: String => Boolean) : String = {
      methodsByClass(cls)
        .filterNot(c => skipper(c._1))
        .to[Seq]
        .sortBy(_._1)
        .map(_._2)
        .flatMap({ md =>
          val m = md.method

          val customs = methodCustomsGet(m)

          if (customs.exists(_.skip)) {
            None
          } else {
            val info = classInfo(cls)

            val top =
              superChainInfo(info)
                .reverse
                .flatMap(_.methods.get(m.name))
                .head

            val overrideParsed =
              info != top.declaringClass

            if (overrideParsed) {
              None
            } else {

              val ret = top.returnType

//              val overrideEffective =
//                customs
//                  .flatMap(_.over)
//                  .getOrElse(overrideParsed)

              val paramCount = top.params.size

              val params =
                if (paramCount == 0) {
                  ""
                } else {
                  val paramsStr = top.params
                    .map({ p =>
                      s"${p.name}: ${p.typeName}"
                    })
                    .mkString(",\n    ")

                  s"""
                     |    ${paramsStr}
                     |  """.stripMargin
                }

//              Some(
//                s"""  // ${createHyperlink(md.functionNode)}
//                    |  ${if (overrideEffective) "override " else ""}def ${m.name.quoted}(${params}) : ${ret} = js.native""".stripMargin
//              )
              Some(
                s"""  // ${createHyperlink(md.functionNode)}
                    |  def ${m.name.quoted}(${params}) : ${ret} = js.native""".stripMargin
              )

            }


          }
        })
        .mkString("\n\n")

    }

    val defaultCtr : Ctr = { functionNode =>
      functionNode.getParameters
        .map({ p =>
          s"${p.getName}: js.Any"
        })
        .to[Seq]
    }

    def extender(superClassName: String, extClassName: String) : (String, String => Boolean, Ctr) = {
      (if (skipExt) None else {
        Try({
          val extCls = Class.forName(extClassName)

          val classSymbol = mirror.classSymbol(extCls)
          val cs = classSymbol.typeSignature

          val skipper : String => Boolean = { name =>
            cs.decl(ru.TermName(name)).isTerm
          }

          val (sc, ctr) = if (classSymbol.isTrait) {
            (s"$superClassName with $extClassName", defaultCtr)
          } else {
            val ctr : Ctr = { fn =>
              cs.decls
                .filter(_.isConstructor)
                .map(_.asMethod)
                .map(_.paramLists)
                .filter(_.size == 1)
                .map(_.head)
                .filterNot(_.isEmpty)
                .headOption
                .map(_.map(v => s"${v.name.toString}: ${v.typeSignature.toString}"))
                .getOrElse(defaultCtr(fn))
            }

            (extClassName, ctr)
          }

          (sc, skipper, ctr)
        }).toOption
      })
      .getOrElse({
        (superClassName, (_: String) => false, defaultCtr)
      })
    }

    scopes.foreach({ case (s, as) =>
      val pkg =
        GlobalPackageSegment ++ s

      val typeName = ((BasePackage ++ pkg) :+ ScopeTypeName).mkString(".")

      val (superClassEffective, skipper, _) =
        extender("js.Object", s"${typeName}Ext")

      write(
        pkg,
        ScopeTypeName,
        s"""@js.native
            |trait ${ScopeTypeName} extends ${superClassEffective} {
            |${innerScopesSource(s)}
            |${staticMembersSource(s, skipper)}
            |}
         """.stripMargin
      )
    })

    classes1.foreach({ c =>
      val className = c.cls.name

      val classInfo = JSClassInfo(c.cls)

      val superClass =
        classInfo.superClass.get.name

      val (superClassEffective, skipper, ctr) =
        extender(superClass, s"${c.cls.typeName}Ext")

      val ctrParams = ctr(c.functionNode)

      val constr = if (ctrParams.size == 0) {
        ""
      } else {
        val paramsStr =
          ctrParams
            .mkString(",\n    ")

        s"""
           |  def this(
           |    ${paramsStr}
           |  ) = this()
         """.stripMargin
      }


      write(
        c.cls.packagePath,
        className,
        s"""@js.native
           |@js.annotation.JSName("${c.cls.fullName}")
           |// ${createHyperlink(c.functionNode)}
           |class ${className} extends ${superClassEffective} {
           |${constr}
           |${classVarsSource(c.cls, skipper)}
           |${classMethodsSource(c.cls, skipper)}
           |
           |}
         """.stripMargin

      )

    })
  }

  def createHyperlink(source: Source, lineNumber: Int) : String = {
    val sourceFile = new File(source.getBase, source.getName).relativeTo(BaseDir).get

    s"${HttpLinkBase}${sourceFile.toString.replace('\\', '/')}?fileviewer=file-view-default#${source.getName}-${lineNumber}"
  }


//  def generateCustom = {
//    import Generator._
//
//    IO.delete(CustomDir)
//    CustomDir.mkdirs()
//
//    IO.write(
//      CustomDir / "custom.scala",
//      s"""package sjsa.generated
//          |
//         |object Custom {
//          |}
//       """.stripMargin
//    )
//
//  }

  def destDir(
    pkg: Path,
    base: File
  ) = {
    val fullPackage = (BasePackage ++ pkg)
    base / fullPackage.mkString("/")
  }


  def write(
    pkg: Path,
    name: String,
    content: String
  ) = {
    val fullPackage = (BasePackage ++ pkg)
    val dir = destDir(pkg, GeneratedDir)
    dir.mkdirs()
    val file = dir / s"${name}.scala"

    IO.write(
      file,
      s"""package ${fullPackage.mkString(".")}
          |
        |import scala.scalajs.js
          |
        |${content}
      """.stripMargin
    )
  }

  def createHyperlink(functionNode: FunctionNode) : String = {
    createHyperlink(
      functionNode.getSource,
      functionNode.getLineNumber
    )
  }
}
