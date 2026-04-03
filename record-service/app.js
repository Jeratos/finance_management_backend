import express from "express";
import pool from "./Db/connect.js";
import init from "./Db/init.js";
import router from "./routers/router.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/", router);

pool
  .connect()
  .then(() => {
    init();
    app.listen(5003, () => {
      console.log("Server started on port 5003");
    });
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err.message);
  });