import express, { Application } from "express";
import dotenv from "dotenv";
import projectRouter from "./router/pjrouter";
import eventRouter from "./router/evenrouter";
import authRouter from "./router/authrouter";
import cors from "cors";



dotenv.config();

const app : Application = express();
const port : number = Number(process.env.PORT) || 3000 ;

app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use(express.json());

app.use("/project", projectRouter);

app.use("/event", eventRouter);
app.use('/uploads', express.static('D:/ActivityUP/backend/uploads'));
app.use("/auth", authRouter);




app.listen(port, () => {
    console.log(`Server is running to port ${port}`);
});

