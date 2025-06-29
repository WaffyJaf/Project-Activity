import express, { Application } from "express";
import dotenv from "dotenv";
import projectRouter from "./router/pjrouter";
import eventRouter from "./router/evenrouter";
import authRouter from "./router/authrouter";
import recordRouter from './router/recordrouter';
import getby from './router/getby';
import cors from "cors";



dotenv.config();

const app : Application = express();
const port : number = Number(process.env.PORT) || 3000 ;

app.use(cors({
  origin: [
    'http://localhost:5173', // สำหรับ frontend อื่น 
    'http://10.0.2.2:3000',  // สำหรับ Android emulator
    'http://172.20.10.2:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use("/project", projectRouter);

app.use("/event", eventRouter);
app.use('/uploads', express.static('D:/ActivityUP/backend/uploads'));
app.use("/auth", authRouter);
app.use("/record", recordRouter);
app.use("/getby", getby);




app.listen(port, () => {
    console.log(`Server is running to port ${port}`);
});