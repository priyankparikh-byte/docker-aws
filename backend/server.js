import express from "express"
import { createServer } from "http"
import {Server} from "socket.io"
import {YSocketIO} from "y-socket.io/dist/server"


const app = express()
const httpServer = createServer(app)
app.use(express.static("public"))

const io = new Server(httpServer,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})

const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()


// app.get('/',(req,res)=>{
//     res.status(200).json({messgae:"hello wolrd"})
// })

app.get('/health',(req,res)=>[
    res.status(200).json({messgae:"hello wolrd"})
])

httpServer.listen(3000,()=>{
    console.log("server staretd")
})