import dotenv from "dotenv"
import {app} from "./app.js"
import connectDB from "./db/index.js";

dotenv.config({
    path: "src/.env"
})

const port= process.env.PORT|| 7000;

connectDB()
.then(app.listen(port, ()=>{
    console.log(`Server is running on ${port}...`)
}))
.catch((err) =>{
    console.log("MongoDb connection error", err)
})