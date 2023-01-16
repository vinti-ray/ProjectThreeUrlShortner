const express = require("express");
const app = express();
const mongoose = require("mongoose");
const route = require("./routes/route");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.set('strictQuery', true)
mongoose
  .connect(
    "mongodb+srv://vintiray:7091201680@cluster0.ahtxrqr.mongodb.net/group07Database",
    {
      useNewUrlParser: true,
    }
  )

  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(3000, () => {
  console.log("Express app running on port " + 3000);
});
