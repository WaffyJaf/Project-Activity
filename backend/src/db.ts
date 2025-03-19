import mysql from "mysql2";
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST as string,
    user: process.env.DATABASE_USER as string,
    password: process.env.DATABASE_PASSWORD as string,
    database: process.env.DATABASE_NAME as string,
});

db.connect((err) => {
    if (err){
        console.error("!!! Error connecting to database !!! ",err);
        return;
    }
    console.log("connec to database");
});

export default db;