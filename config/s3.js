const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const dotenv = require("dotenv");

// 현재 실행 중인 환경을 확인하고, 해당하는 .env 파일 로드
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });

// AWS S3 설정
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

// multer 설정 (S3에 업로드)
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: "public-read", // S3에 업로드된 파일을 공개 읽기 가능하도록 설정
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `uploads/${Date.now()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 최대 5MB 제한
});

module.exports = upload;
