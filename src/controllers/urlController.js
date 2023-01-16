const urlModel = require("../model/urlModel");
const shortid = require("shortid");
const validUrl = require("valid-url");
const axios = require("axios");

//=========================POST /url/shorten==========================

const createUrl = async (req, res) => {
  try {
    let data = req.body;

    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please send some data in body" });

    let longUrl = data.longUrl;

    if (!validUrl.isUri(longUrl.trim()))
      return res
        .status(400)
        .send({ status: false, message: "please enter valid url" });

    const isUrlExist = await axios
      .get(longUrl.trim())
      .then(() => longUrl)
      .catch(() => null);

    if (!isUrlExist)
      return res
        .status(404)
        .send({ status: false, message: "url doesn't exist" });

    const findUrl = await urlModel.findOne({ longUrl: longUrl });

    if (findUrl) {
      return res.status(200).send({
        status: true,
        data: {
          longUrl: findUrl.longUrl,
          shortUrl: findUrl.shortUrl,
          urlCode: findUrl.urlCode,
        },
      });
    }

    let urlCode = shortid.generate(longUrl);

    let baseUrl = req.protocol + "://" + req.get("host");

    let shorturl = baseUrl + "/" + urlCode;

    data.urlCode = urlCode;
    data.shortUrl = shorturl;

    const createUrl = await urlModel.create(data);

    const responseData = {
      longUrl: createUrl.longUrl,
      shortUrl: createUrl.shortUrl,
      urlCode: createUrl.urlCode,
    };

    res.status(201).send({ status: true, data: responseData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//================================== GET /:urlCode ==============================

const getData = async (req, res) => {
  try {
    let urlCode = req.params.urlCode;

    if (!urlCode)
      return res
        .status(400)
        .send({ status: false, message: "please enter url in param" });

    const findData = await urlModel.findOne({ urlCode: urlCode });

    if (!findData)
      return res
        .status(404)
        .send({ status: false, message: "no data exist with this urlCode" });

    res.status(302).redirect(findData.longUrl);
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.createUrl = createUrl;
module.exports.getData = getData;
