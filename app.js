const express = require("express");
const axios = require("axios");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
app.use(cors());
app.use(morgan("tiny"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;
  const { data } = await axios.get(
    "https://jsonplaceholder.typicode.com/photos",
    { params: { albumId } }
  );
  res.status(200).json(data);
});

app.get("/photos/:id", async (req, res) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
  );
  res.status(200).json(data);
});

app.listen(2222, () => console.log("Listening on 2222.."));
