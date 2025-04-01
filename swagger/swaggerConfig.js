const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");
const express = require("express");

// Swagger 설정 옵션
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API 문서",
    },
    servers: [
      {
        url: "http://localhost:8080/api-server",
        description: "로컬 개발 서버",
      },
    ],
  },
  apis: [
    path.join(__dirname, "user.yaml"),
    path.join(__dirname, "item.yaml"),
    path.join(__dirname, "chat.yaml"),
  ],
};

// Swagger 문서 생성
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger 설정 함수
const setupSwagger = (app) => {
  // Swagger UI 경로 설정
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // 정적 파일 제공 추가 (Swagger UI에서 YAML 참조 가능)
  app.use("/api-docs/paths", express.static(path.join(__dirname, "paths")));

  console.log("Swagger UI: http://localhost:8080/api-docs");
};

module.exports = setupSwagger;
