import mongoose from "mongoose";
export type DbClient = mongoose.Mongoose;

export async function getDatabaseClient(connectionString: string) {
  return new Promise<DbClient>((resolve, reject) => {
    mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = mongoose.connection;
    db.on("error", (e: Error) => {
      console.error("Db connection error:", e);
      reject(e);
    });
    db.once("open", () => {
      console.log("Db connection success:", connectionString);
      resolve(mongoose);
    });
  });
}
