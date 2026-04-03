import express from "express";
import dashboardRoutes from "./routers/route.js";
import pool from "./Db/connect.js";

const app = express();

app.use(express.json());

app.use("/", dashboardRoutes);

pool.connect().then(() => {
    app.listen(5002, () => {
        console.log("Server is running on port 5002");
    });
    console.log("Connected to database");
}).catch((err) => {
    console.log(err);
});
