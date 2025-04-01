const Map = require("../model");

// front에 sql값 전달
exports.map = async (req, res) => {
  try {
    const map = await Map.findAll();

    res.json({ map: map });
  } catch (err) {
    console.error(err);
  }
};

exports.mapData = (req, res) => {
  res.send("mapData");
};
