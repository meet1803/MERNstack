const App = require("./app");

const dotenv=require("dotenv");
const connectDatabase = require("./config/database");

//Handling Uncaught Exception
process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down due to uncaught Exception`);
    process.exit(1);
})

//config

dotenv.config({path:"backend/config/config.env"})

//connecting database
connectDatabase();

const server=App.listen(process.env.PORT,()=>{
    console.log(`Server is working at http://localhost:${process.env.PORT}`);
})

// Unhandled Promise Rejection

process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to unhandeled Promise rejection`);

    server.close(()=>{
        process.exit(1);
    })
})