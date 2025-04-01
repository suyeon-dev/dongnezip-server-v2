const jwt = require("jsonwebtoken");
const { User } = require("../model");

const SECRET_KEY = process.env.SECRET_KEY;

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.authToken; //  쿠키에서 토큰 읽기

  if (!token) {
    // 토큰이 없는 경우
    req.user = null; // 사용자 정보를 null로 설정
    return next(); // 요청을 컨트롤러로 넘김
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // 토큰 검증
    const user = await User.findOne({ where: { id: decoded.userId } }); // 사용자 조회

    if (!user) {
      // 사용자를 찾지 못한 경우
      req.user = null;
      return next();
    }

    req.user = user; // 요청 객체에 사용자 정보 추가
    next(); // 요청 계속 처리
  } catch (error) {
    console.error("JWT 검증 실패:", error.message);
    req.user = null; // JWT 검증 실패 시 사용자 정보를 null로 설정
    next(); // 요청 계속 처리
  }
};

module.exports = authenticateToken;
