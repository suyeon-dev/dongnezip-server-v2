const express = require("express");
const controller = require("../controller/Citem");
const router = express.Router();
const authenticateToken = require("../middlewares/jwtAuth");
const upload = require("../config/s3");

/** 전체 상품 조회 */
// GET /api-server/item/item
router.get("/item", authenticateToken, controller.getAllItems);

/** 판매자 판매물품 조회 */
// GET /api-server/item/soldItems
router.get("/soldItems", authenticateToken, controller.getSoldItemsByUser);

/** 상품 검색 */
// GET /api-server/item/search?keyword=검색어
router.get("/search", authenticateToken, controller.searchItems);

/** 판매 왕 (최다 판매자) 조회 */
// GET /api-server/item/topSeller
router.get("/topSeller", controller.topSeller);

/** 구매 왕 (최다 구매자) 조회 */
// GET /api-server/item/topBuyer
router.get("/topBuyer", controller.topBuyer);

/** 상품 거래 완료 */
// POST /api-server/item/complete
router.post("/complete", authenticateToken, controller.completeItemTransaction);

/** 상품 찜하기 */
// POST /api-server/item/favorites
router.post("/favorites", authenticateToken, controller.addToFavorites);

/** 상품 찜 취소 */
// DELETE /api-server/item/favorites/:itemId
router.delete(
  "/favorites/:itemId",
  authenticateToken,
  controller.removeFromFavorites
);

/** 판매 글 등록 */
// POST /api-server/item/addItem
router.post(
  "/addItem",
  upload.array("imageUrls", 5),
  authenticateToken,
  controller.createItem
);

/** 판매 글 수정 */
// PATCH /api-server/item/:itemId
router.patch(
  "/:itemId",
  authenticateToken,
  upload.array("imageUrls", 5),
  controller.updateItem
);

/** 판매 글 삭제 */
// DELETE /api-server/item/:itemId
router.delete("/:itemId", authenticateToken, controller.deleteItem);

/** 상품 상세 조회 (라우트 충돌 방지를 위해 마지막에 배치) */
// GET /api-server/item/:itemId
router.get("/:itemId", authenticateToken, controller.getItemDetail);

module.exports = router;
