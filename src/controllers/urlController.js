const urlModel = require("../model/urlModel");
const shortid = require("shortid");
const validUrl = require("valid-url");
const axios = require("axios");
const redis =require("redis")
const { promisify }=require("util")

const redisClient = redis.createClient(
  17213,
  "redis-17213.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("s4VNvsLVMbXsGRwf1loHzelTXVjYelvN", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});



//2. Prepare the functions for each command

const SET_ASYNC = promisify(redisClient.SETEX).bind(redisClient);

const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


//=========================POST /url/shorten==========================

const UrlShorten = async (req, res) => {
  try {
    let data = req.body;
    
    let longUrl = data.longUrl;

    let cahcedUrl = await GET_ASYNC(`${longUrl}`)
    if(cahcedUrl) {
     return res.status(200).send({status:true,message:"data coming from cache",data:JSON.parse(cahcedUrl)})
    } 
    
   if (Object.keys(data).length == 0) { return res.status(400).send({ status: false, message: "please send some data in body" })};

    if(typeof longUrl!="string") { return res.status(400).send({ status: false, message: "type of url must be a string" })};

    longUrl = longUrl.trim();

    if (!validUrl.isUri(longUrl)) { return res.status(400).send({ status: false, message: "please enter valid url" })};

    const isUrlExist = await axios
      .get(longUrl)
      .then(() => longUrl)
      .catch(() => null);

    if (!isUrlExist) { return res.status(400).send({ status: false, message: "url doesn't exist" })};

    const findUrl = await urlModel.findOne({ longUrl: longUrl });

    if (findUrl) { return res.status(200).send({ status: true,
        data: {
          longUrl: findUrl.longUrl,
          shortUrl: findUrl.shortUrl,
          urlCode: findUrl.urlCode 
        }
      })};

    let urlCode = shortid.generate();
    let baseUrl = req.protocol + "://" + req.get("host");

    let shortUrl = baseUrl + "/" + urlCode;

    data={urlCode,shortUrl,longUrl}


    //3. Start using the redis commad
  // let cahcedUrl = await GET_ASYNC(`${longUrl}`)

  // if(cahcedUrl) {
  //  res.status(200).send(cahcedUrl)
  // } else {
    // const findUrl = await urlModel.findOne({ longUrl: longUrl });

    // if (findUrl) { return res.status(200).send({ status: true,message:"data coming from db",
    //     data: {
    //       longUrl: findUrl.longUrl,
    //       shortUrl: findUrl.shortUrl,
    //       urlCode: findUrl.urlCode 
    //     }
    //   })};

      const createUrl = await urlModel.create(data);
      const responseData = {
      longUrl: createUrl.longUrl,
      shortUrl: createUrl.shortUrl,
      urlCode: createUrl.urlCode
    };
      await SET_ASYNC(`${longUrl}`,86400,JSON.stringify(responseData))
      res.status(201).send({ status: true,message:"data created successfully", data: responseData });
  // }


    // const createUrl = await urlModel.create(data);

    // await SET_ASYNC(`${createUrl.shortUrl}`, JSON.stringify(createUrl.longUrl))

// +So in our application we would want to implement caching so that a newly created link is cached for 24 hours. When a person uses a short url, the long url should be retrieved from cache in the first 24 hours of that url being created.

// +- Use caching while fetching the shortened url to minimize db calls.

    // const responseData = {
    //   longUrl: createUrl.longUrl,
    //   shortUrl: createUrl.shortUrl,
    //   urlCode: createUrl.urlCode
    // };

    // res.status(201).send({ status: true, data: responseData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//================================== GET /:urlCode ==============================

const getUrl = async (req, res) => {
  try {
    let urlCode = req.params.urlCode;
        urlCode = urlCode.trim();

    if (!urlCode) { return res.status(400).send({ status: false, message: "please enter url in param" })};

    if(!shortid.isValid(urlCode)) { return res.status(400).send({ status: false, message: "urlCode is not a valid shortid" })};

    let findUrl = await GET_ASYNC(`${urlCode}`)
    if(findUrl) {
      return res.status(302).redirect(JSON.parse(findUrl));
    } else {
      const findData = await urlModel.findOne({ urlCode: urlCode });

      if (!findData) { return res.status(404).send({ status: false, message: "no data exist with this urlCode" })};

      await SET_ASYNC(`${urlCode}`,86400, JSON.stringify(findData.longUrl))
      res.status(302).redirect(findData.longUrl);
    }
    // const findData = await urlModel.findOne({ urlCode: urlCode });

    // if (!findData) { return res.status(404).send({ status: false, message: "no data exist with this urlCode" })};

    // res.status(302).redirect(findData.longUrl);
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.UrlShorten = UrlShorten;
module.exports.getUrl = getUrl;

//

