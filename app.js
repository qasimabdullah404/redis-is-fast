const express = require("express");
const axios = require("axios");
const cors = require("cors");
const morgan = require("morgan");
const Redis = require("redis");

const redisClient = Redis.createClient();
const DEFAULT_EXPIRY_TIME = 1800;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;

  const photos = await cache(`photos:albumId:${albumId}`, async () => {
    const { data } = await axios.get(
      "https://jsonplaceholder.typicode.com/photos",
      { params: { albumId } }
    );
    return data;
  });

  res.status(200).json(photos);
});

app.get("/photos/:id", async (req, res) => {
  const photos = await cache(`photos:id:${req.params.id}`, async () => {
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
    );
    return data;
  });

  res.status(200).json(photos);
});

const cache = (key, callback) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, async (err, data) => {
      if (err) reject(err);
      if (data != null) return resolve(JSON.parse(data));

      const makeCache = await callback();
      redisClient.setex(key, DEFAULT_EXPIRY_TIME, JSON.stringify(makeCache));
      resolve(makeCache);
    });
  });
};

app.listen(2222, () => console.log("Listening on 2222.."));
