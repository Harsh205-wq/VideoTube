import dotenv from "dotenv"
import {app} from "./app.js"
import connectDB from "./src/db/index.js"


dotenv.config({
  path:"./.env"  // config dotenv before using process.env.Variable
})

const PORT=process.env.PORT ||7000

connectDB()
.then(() => {
  app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
  })
  
}
)
.catch((err) => {
  console.log("Momgodb conncetion error",err)
}
)
