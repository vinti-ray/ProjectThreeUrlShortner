const urlModel = require("../model/urlModel");
const shortid = require("shortid");
const validUrl = require("valid-url");
const axios = require("axios");

//=========================POST /url/shorten==========================

const UrlShorten = async (req, res) => {
  try {
    let data = req.body;

    if (Object.keys(data).length == 0) { return res.status(400).send({ status: false, message: "please send some data in body" })};

    let longUrl = data.longUrl;

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

    const createUrl = await urlModel.create(data);

    const responseData = {
      longUrl: createUrl.longUrl,
      shortUrl: createUrl.shortUrl,
      urlCode: createUrl.urlCode
    };

    res.status(201).send({ status: true, data: responseData });
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

    const findData = await urlModel.findOne({ urlCode: urlCode });

    if (!findData) { return res.status(404).send({ status: false, message: "no data exist with this urlCode" })};

    res.status(302).redirect(findData.longUrl);
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.UrlShorten = UrlShorten;
module.exports.getUrl = getUrl;
