import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"
// cors is a middleware

const app=express()

app.use(
    cors({ // it deals with the frontend connection
        origin:process.env.CORS_ORIGIN,
        credentials:true
    })
)
// common middleware setup before writing logic
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

// import routes
import healthcheckRouter from "./src/routes/healthcheck.routes.js"
import userRouter from "./src/routes/user.routes.js"

// routes
app.use("/api/v1/healthcheck",healthcheckRouter)
app.use("/api/v1/users",userRouter)

export {app}