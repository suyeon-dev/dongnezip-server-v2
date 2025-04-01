const express = require("express");
const passport = require("passport");
const UserController = require("../controller/Cuser");
const authenticateToken = require("../middlewares/jwtAuth");
const upload = require("../config/s3");
const router = express.Router();

// 로그인 유지
router.post("/token", authenticateToken, UserController.token);

// 인증 번호 이메일 전송
router.post("/sendCode", UserController.sendCode);

// 인증번호 검증
router.post("/verifyCode", UserController.verifyCode);

// 회원가입 (로컬)
router.post("/join", UserController.join);

// 비밀번호 찾기
router.post("/findPw", UserController.findPw);

// 아이디 중복 검사
router.post("/checkId", UserController.checkId);

// 로컬 로그인
router.post("/login/local", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || "로그인 실패" });
    }

    req.user = user;
    UserController.localLogin(req, res, next);
  })(req, res, next);
});

// 카카오 로그인
router.get("/login/kakao", (req, res, next) => {
  console.log("카카오 로그인 요청");
  passport.authenticate("kakao", { session: false })(req, res, next);
});

// 카카오 로그인 콜백
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    session: false,
  }),
  (req, res, next) => {
    console.log("ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ");
    UserController.kakaoLogin(req, res, next);
  },
  (err, req, res, next) => {
    console.error("Kakao login failed:", err);
    res.status(401).json({
      message: "카카오 로그인 실패",
      error: err.message,
    });
  }
);

// 로그아웃
router.post("/logout", authenticateToken, UserController.logout);

// 회원 정보 수정
router.patch(
  "/changeInfo",
  authenticateToken,
  upload.single("profileImg"),
  UserController.changeInfo
);

// 회원 탈퇴
router.delete("/deleteUser", authenticateToken, UserController.deleteUser);

// 닉네임 중복 검사
router.post("/checkNick", authenticateToken, UserController.checkNick);

/* 마이페이지 */

// 마이페이지 메인
router.get("/mypage", authenticateToken, UserController.mypage);

// 판매 내역
router.get("/soldItems", authenticateToken, UserController.soldItems);

// 구매 내역
router.get("/boughtItems", authenticateToken, UserController.boughtItems);

// 찜 내역
router.get("/LikeItems", authenticateToken, UserController.LikeItems);

module.exports = router;
