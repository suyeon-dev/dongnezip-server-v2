const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

const { User } = require("../model");

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: process.env.KAKAO_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("Kakao profile:", profile);
        try {
          let exUser = await User.findOne({
            where: {
              email: profile._json.kakao_account.email,
              provider: "kakao",
            },
          });

          if (exUser) {
            return done(null, exUser);
          } else {
            exUser = new User({
              name: profile.id,
              email: profile._json.kakao_account.email,
              nickname: profile.displayName,
              provider: "kakao",
            });

            await exUser.save();

            console.log("카카오 회원 회원가입 성공", exUser);
            return done(null, exUser);
          }
        } catch (error) {
          console.log("카카오 로그인 또는 회원가입 못하고 에러", error);
          return done(error);
        }
      }
    )
  );
};
