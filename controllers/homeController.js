const BigPromise = require("../middlewares/bigPromise");

exports.home = BigPromise(async (req, res) => {
  res.status(200).json({
    success: true,
    greeting: "Hellow from api",
  });
});

exports.homeDummy = BigPromise(async (req, res) => {
  res.status(200).json({
    success: true,
    greeting: "Dummy Routes",
  });
});
