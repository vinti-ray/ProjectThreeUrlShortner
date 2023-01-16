const urlModel = require("../model/urlModel");
const shortid = require("shortid");
const validUrl = require("valid-url");
const axios=require("axios")

const createUrl = async (req, res) => {
  try {
    let data = req.body;

    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please send some data in body" });

    let longUrl = data.longUrl;

    if (!validUrl.isUri(longUrl))
      return res
        .status(400)
        .send({ status: false, message: "please enter valid url" });



    const isUrlExist=await axios.get(longUrl).then((res)=>longUrl)
    .catch(()=>null)

    if(!isUrlExist)  return res.status(404).send({status:false,message:"url doesn't exist"})


    // console.log(longUrl)

    let urlCode = shortid.generate(longUrl);

    let baseUrl = req.protocol + "://" + req.get("host");

    let shorturl = baseUrl + "/" + urlCode;


    data.urlCode = urlCode;
    data.shortUrl = shorturl;

    const findUrl=await urlModel.findOne({longUrl:longUrl}).select({longUrl:1,shortUrl:1,urlCode:1,_id:0})

    console.log(findUrl)

    if(findUrl) {
         return res.status(200).send({status:true,data:findUrl})
    }
   
    const createUrl = await urlModel.create(data);

    
    const responseData = {
      longUrl: createUrl.longUrl,
      shortUrl: createUrl.shortUrl,
      urlCode: createUrl.urlCode,
    };


    res.status(201).send({status:true, data: responseData });
  } catch (error) {
    res.status(500).send({status:false, message: error.message });
  }
};


const getData=async (req,res)=>{
try {
	    let urlCode=req.params.urlCode
        
	    if(!urlCode)  return res.status(400).send({status:false,message:"please enter url in param"})
	
	    const findData=await urlModel.findOne({urlCode:urlCode})
	
	    if(!findData)  return res.status(404).send({status:false,message:"no data exist with this urlCode"})
	
	    res.status(302).redirect(findData.longUrl)
} catch (error) {
	res.status(500).send({status:false,message:error.message})
}
}

module.exports.createUrl = createUrl;

module.exports.getData=getData
// POST /url/shorten
// Create a short URL for an original url recieved in the request body.
// The baseUrl must be the application's baseUrl. Example if the originalUrl is http://abc.com/user/images/name/2 then the shortened url should be http://localhost:3000/xyz
// Return the shortened unique url. Refer this for the response
// Ensure the same response is returned for an original url everytime
// Return HTTP status 400 for an invalid request
// GET /:urlCode
// Redirect to the original URL corresponding
// Use a valid HTTP status code meant for a redirection scenario.
// Return a suitable error for a url not found
// Return HTTP status 400 for an invalid request