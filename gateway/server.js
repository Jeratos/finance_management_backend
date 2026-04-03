import express from "express";
import proxy from "express-http-proxy";
import cors from "cors";


const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", proxy("http://localhost:5001"));
app.use("/api/dashboard", proxy("http://localhost:5002"));
app.use("/api/finance-records", proxy("http://localhost:5003"));


app.listen(5000, () => {
    console.log("Server is running on: http://localhost:5000");
});