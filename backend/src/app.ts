import express, { Application } from "express";
import dotenv from "dotenv";
import projectRouter from "./router/pjrouter";
import eventRouter from "./router/evenrouter";
import cors from "cors";


dotenv.config();

const app : Application = express();
const port : number = Number(process.env.PORT) || 3000 ;

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());

app.use("/project", projectRouter);

app.use("/event", eventRouter);



app.listen(port, () => {
    console.log(`Server is running to port ${port}`);
});

