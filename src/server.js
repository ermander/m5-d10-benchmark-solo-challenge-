const express = require("express")
const cors = require ("cors")
const listEndpoints = require("express-list-endpoints")
const mediaRouter = require("./media/index")
const reviewsRouter = require("./reviews/index")
const {
    notFoundHandler,
    badRequestHandler,
    genericErrorHandler,
  } = require("./errorHandlers")

const server = express()

const port = process.env.PORT || 3001

server.use(express.json())

server.use(cors())

//ROUTES
server.use("/media", mediaRouter)
server.use("/reviews", reviewsRouter)

server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

console.log(listEndpoints(server))

server.listen(port, () => {
  console.log("Running on port", port)
})
