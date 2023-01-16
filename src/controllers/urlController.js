const urlModel=require("../model/urlModel")
const shortid=require("shortid")
const validUrl=require("valid-url")



const createUrl=async (req,res)=>{
    try {
        let {longUrl}=req.body
        // console.log(longUrl)
        let x=shortid.generate(longUrl)
        let shorturl="http://localhost:3000/"+x

        // console.log(shorturl)

        console.log(req.baseUrl)
        res.send("done")
    } catch (error) {
        res.status(500).send({msg:error.message})
    }
}


module.exports.createUrl=createUrl



// POST /url/shorten
// Create a short URL for an original url recieved in the request body.
// The baseUrl must be the application's baseUrl. Example if the originalUrl is http://abc.com/user/images/name/2 then the shortened url should be http://localhost:3000/xyz
// Return the shortened unique url. Refer this for the response
// Ensure the same response is returned for an original url everytime
// Return HTTP status 400 for an invalid request