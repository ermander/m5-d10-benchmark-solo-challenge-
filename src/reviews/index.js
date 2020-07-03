const express = require("express")
const { readDB, writeDB } = require("../utilities")
const { join } = require("path")
const uniqid = require("uniqid")
const { check, validationResult } = require("express-validator")
const reviewsJsonPath = join(__dirname, "reviews.json")
const reviewsRouter = express.Router()

reviewsRouter.get("/", async (req, res, next) => {
    try {
        const reviews = await readDB(reviewsJsonPath)
        res.send(reviews).status(200)       
    } catch (error) {
        next(error)       
    }
})

reviewsRouter.get("/:imdbID", async (req, res, next) => {
    try {
        const reviews = await readDB(reviewsJsonPath)
        const currentreview = reviews.find(review => review.elementId === req.params.imdbID)
        res.send(currentreview).status(200)        
    } catch (error) {
        next(error)
    }    
})  

reviewsRouter.post("/", 
    [
        check("comment").exists().withMessage("You have to specified the comment!"),
        check("rate").exists().withMessage("You have to specified the rate!")
    ],
    async (req, res, next) => {
        const error = validationResult(req)
        if(!error.isEmpty()){
            const error = new Error()
            error.httpStatusCode = 400
            error.message = error
        }        
    try {
        const reviews = await readDB(reviewsJsonPath) 
        console.log("This is the body" + req.body)
        const newReview = {   
            _id: uniqid(),         
            ...req.body,
            createdAt: new Date()
        }
        reviews.push(newReview)
        await writeDB(reviewsJsonPath, reviews) 
        res.status(201).send(reviews)
    } catch (error) {
        next(error)    
        console.log(error)    
    }    
})

reviewsRouter.put("/:imdbID", async (req, res, next) => {
    try {
        const reviews = await readDB(reviewsJsonPath)
        const review = reviews.find((r) => r.elementId === req.params.imdbID)
        if(review){
            const position = reviews.indexOf(review)
            const reviewUpdated = { ...review, ...req.body }
            reviews[position] = reviewUpdated
            await writeDB(reviewsJsonPath, reviews)
            res.send(reviews).status(200)
        }else{
            const error = new Error(`Review with imdbID ${req.params.imdbID} not found`)
            error.httpStatusCode = 404
            next(error)
        }        
    } catch (error) {
        console.log(error)
        next(error)
    }    
})

reviewsRouter.delete("/:elementId", async (req, res, next) => {
    try {
        const reviews = await readDB(reviewsJsonPath) 
        const updatedReviewsArray = reviews.filter(review => review.imdbID !== req.params.imdbID)
        await writeDB(reviewsJsonPath, updatedReviewsArray)
        res.send(updatedReviewsArray).status(201)
    } catch (error) { 
        console.log(error) 
        next(error)  
    }    
})


module.exports = reviewsRouter