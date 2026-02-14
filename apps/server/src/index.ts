import express from "express"
import {config} from "dotenv"

const PORT = process.env.PORT || 8080



const app = express()



app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
        process.exit(1);
    } else {
        console.log("Server is running at port " + PORT + "!!!!");
    }
});