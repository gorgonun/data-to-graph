ThisBuild / version := "0.1.0-SNAPSHOT"

ThisBuild / scalaVersion := "2.13.11"

lazy val root = (project in file("."))
  .settings(
    name := "json-to-graph"
  )

libraryDependencies ++= Seq(
  "org.mongodb.spark" %% "mongo-spark-connector" % "10.2.0",
  "org.apache.spark" %% "spark-core" % "3.3.2",
  "org.apache.spark" %% "spark-sql" % "3.3.2",

  "org.neo4j" % "neo4j-connector-apache-spark_2.12" % "5.0.3",
  "org.mongodb.spark" %% "mongo-spark-connector" % "10.2.0",
)
