import org.apache.spark.sql.SparkSession

object JsonToGraph {
  def main(args: Array[String]): Unit = {
    val spark = SparkSession.builder()
      .master("local")
      .appName("JsonToGraph")
      .config("spark.mongodb.read.connection.uri", sys.env("MONGODB_URL"))
      .config("spark.mongodb.write.connection.uri", sys.env("MONGODB_URL"))
      .getOrCreate()

    val df = spark.read.format("mongodb").option("collection", sys.env("MONGODB_COLLECTION")).load()
    df.printSchema();
  }
}
