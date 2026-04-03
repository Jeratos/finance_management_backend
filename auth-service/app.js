import express from "express";
import router from "./routes/router.js";
import pool from "./DB/connect.js";
import createTable from "./DB/init.js";
// import dotenv from "dotenv";

// dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

pool.connect().then( () => {
    createTable();
    app.listen(5001, () => {
        console.log(`Server is running on port 5001`);
    });
    console.log("Database connected");
}).catch((err) => {
    console.log(err);
});

