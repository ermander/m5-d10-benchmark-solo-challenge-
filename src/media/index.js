const express = require("express")
const { join } = require("path")
const { readDB, writeDB } = require("../utilities")
const { check, validationResult } = require("express-validator")

const moviesJsonPath = join(__dirname, "movies.json")

const mediaRouter = express.Router()

mediaRouter.get("/", async (req, res, next) => {
    try {
        const movies = await readDB(moviesJsonPath)
        res.send(movies)    
    } 
    catch (error) {
        console.log(error)
        next(error)
    }
})

mediaRouter.get("/:imdbID", async (req, res, next) => {
    try {
        const movies = await readDB(moviesJsonPath)
        const movie = movies.find((m) => m.imdbID === req.params.imdbID)
        res.send(movie).status(200)    
    } catch (error) {
        next(error)        
    }
})


mediaRouter.post("/",  
  [
    check("Title").exists().withMessage("You have to specifie a title!"),
    check("Year").exists().withMessage("You have to specifie a Year!"),
    check("imdbID").exists().withMessage("You have to specifie a imdbID!"),
    check("Type").exists().withMessage("You have to specifie a Type!"),
    check("Poster").exists().withMessage("You have to specifie a Poster!")
  ],
  async (req, res, next) => {
    const error = validationResult(req)
    if(!error.isEmpty()){
      const error = new Error()
      error.httpStatusCode = 400
      error.message = error
    }
      try {
        const movies = await readDB(moviesJsonPath)
        const imdbIDCheck = movies.find((x) => x.imdbID === req.body.imdbID)
        if (imdbIDCheck) {
          const error = new Error()
          error.httpStatusCode = 400
          error.message = "imdbID should be unique"
          next(error)
        } else {
          movies.push(req.body)
          await writeDB(moviesJsonPath, movies)
          res.status(201).send("Created")
        }
      } catch (error) {
        next(error)
      }
    }
)

mediaRouter.put("/:imdbID", async (req, res, next) => {  // Not Working!
    try {
      const movies = await readDB(moviesJsonPath)
      const movie = movies.find((movie) => movie.imdbID === req.params.imdbID)
      if (movie) {
        const position = movies.indexOf(movie)
        const movieUpdated = { ...movie, ...req.body }
        movies[position] = movieUpdated
        await writeDB(moviesJsonPath, movies)
        res.status(200).send("Updated")
      } else {
        const error = new Error(`Movies with imdbID ${req.params.imdbID} not found`)
        error.httpStatusCode = 404
        console.log(error)
        next(error)
      }
    } catch (error) {
        console.log(error)
        next(error)
    }
  })

mediaRouter.delete("/:imdbID", async (req, res) => {
    try {
        const movies = await readDB(moviesJsonPath)
        const movie = movies.find((m) => m.imdbID === req.params.imdbID)
        if(movie){
            await writeDB(
                moviesJsonPath, 
                movies.filter((m) => m.imdbID !== req.params.imdbID)
            )
            res.send("Deleted!")
        }else{
            const error = new error(`Movie this imdbID ${req.params.imdbID} not found!`)
            error.httpStatusCode=404
            next(error)
        }
      }
      catch (error) {
          next(error)        
    }
})

module.exports = mediaRouter