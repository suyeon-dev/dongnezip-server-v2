const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../model/User");

module.exports = () => {
  local();
  kakao();
};
