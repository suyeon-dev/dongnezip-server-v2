const axios = require("axios");
const db = require("../model");
const { Item, Category, Map, Region, ItemImage, Favorite, Transaction } = db;
const upload = require("../config/s3");
require("dotenv").config();
const { Op, Sequelize } = require("sequelize");
const KAKAO_API_KEY = process.env.KAKAO_API_KEY; // 카카오 REST API 키 입력

/** 최다 판매자 조회 */
// GET /api-server/item/topSeller
exports.topSeller = async (req, res) => {
  try {
    const db = require("../model");
    const { Transaction, User } = db;

    // 1최다 판매자 5명 조회
    const topSellers = await Transaction.findAll({
      attributes: [
        "sellerId",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "salesCount"],
      ],
      where: { sellerId: { [Op.ne]: null } }, // null 값 제외
      group: ["sellerId"],
      order: [[Sequelize.literal("salesCount"), "DESC"]],
      limit: 5, // 5명까지 조회
      raw: true,
    });

    console.log("최다 판매자 데이터:", topSellers);

    if (!topSellers || topSellers.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "판매 데이터가 없습니다." });
    }

    // 2최다 판매자 정보 조회 (User 테이블에서 가져오기)
    const sellerIds = topSellers.map((seller) => seller.sellerId);

    const sellers = await User.findAll({
      where: { id: sellerIds },
      attributes: ["id", "nickname", "profileImg"],
      raw: true,
    });

    // 판매 데이터 + 사용자 정보를 매칭
    const result = topSellers.map((seller) => {
      const userInfo = sellers.find((user) => user.id === seller.sellerId);
      return {
        id: seller.sellerId,
        nickname: userInfo ? userInfo.nickname : "알 수 없음",
        profileImage: userInfo ? userInfo.profileImg : null,
        salesCount: seller.salesCount,
      };
    });

    return res.status(200).json({
      success: true,
      message: "최다 판매자 조회 성공",
      topSellers: result,
    });
  } catch (error) {
    console.error("판매 왕 조회 오류:", error);
    return res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
};

/** 구매 왕 (최다 구매자) 조회 */
// GET /api-server/item/topBuyer
exports.topBuyer = async (req, res) => {
  try {
    const db = require("../model");
    const { Transaction, User } = db;

    // 최다 구매자 5명 조회
    const topBuyers = await Transaction.findAll({
      attributes: [
        "buyerId",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "purchaseCount"],
      ],
      where: { buyerId: { [Op.ne]: null } }, // null 값 제외
      group: ["buyerId"],
      order: [[Sequelize.literal("purchaseCount"), "DESC"]],
      limit: 5, //5명까지 조회
      raw: true,
    });

    console.log("최다 구매자 데이터:", topBuyers);

    if (!topBuyers || topBuyers.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "구매 데이터가 없습니다." });
    }

    // 최다 구매자 정보 조회 (User 테이블에서 가져오기)
    const buyerIds = topBuyers.map((buyer) => buyer.buyerId);

    const buyers = await User.findAll({
      where: { id: buyerIds },
      attributes: ["id", "nickname", "profileImg"],
      raw: true,
    });

    // 구매 데이터 + 사용자 정보를 매칭
    const result = topBuyers.map((buyer) => {
      const userInfo = buyers.find((user) => user.id === buyer.buyerId);
      return {
        id: buyer.buyerId,
        nickname: userInfo ? userInfo.nickname : "알 수 없음",
        profileImage: userInfo ? userInfo.profileImg : null,
        purchaseCount: buyer.purchaseCount,
      };
    });

    return res.status(200).json({
      success: true,
      message: "최다 구매자 조회 성공",
      topBuyers: result,
    });
  } catch (error) {
    console.error("구매 왕 조회 오류:", error);
    return res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
};

// 카카오맵 API를 이용한 좌표 → 주소 변환 함수
async function getAddressFromCoordinatesKakao(latitude, longitude) {
  try {
    console.log("카카오API", KAKAO_API_KEY);
    const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`;
    const headers = { Authorization: `KakaoAK ${KAKAO_API_KEY}` };

    const response = await axios.get(url, { headers });
    const { documents } = response.data;

    if (!documents || documents.length === 0) {
      return {
        province: null,
        district: null,
        address: null,
        roadAddress: null,
      };
    }

    const addressInfo = documents[0].address;
    const roadAddressInfo = documents[0].road_address || null;

    return {
      province: addressInfo.region_1depth_name, // 시/도
      district: addressInfo.region_2depth_name, // 시/군/구
      address: addressInfo.address_name, // 전체 주소
      roadAddress: roadAddressInfo
        ? roadAddressInfo.address_name
        : "도로명 주소 없음",
    };
  } catch (error) {
    console.error("Kakao Maps API Error:", error);
    return { province: null, district: null, address: null, roadAddress: null };
  }
}

// 판매 글 등록 + 이미지 업로드
// POST /api-server/item/addItem
exports.createItem = async (req, res) => {
  const transaction = await Item.sequelize.transaction();
  try {
    const {
      categoryId,
      title,
      price,
      detail,
      itemStatus,
      latitude,
      longitude,
      placeName,
    } = req.body;

    const userId = req.user?.id || null;

    if (
      !categoryId ||
      !title ||
      !price ||
      !itemStatus ||
      !latitude ||
      !longitude
    ) {
      return res
        .status(400)
        .json({ success: false, message: "필수 정보를 입력하세요." });
    }

    // Kakao Maps API를 이용하여 시/도(province), 시/군/구(district) 가져오기
    const { province, district, address, roadAddress } =
      await getAddressFromCoordinatesKakao(latitude, longitude);

    if (!province || !district) {
      return res
        .status(404)
        .json({ success: false, message: "위치 정보를 가져올 수 없습니다." });
    }

    // `region` 테이블에서 해당 지역 조회하여 `regionId` 찾기
    let regionData = await Region.findOne(
      { where: { province, district } },
      { transaction }
    );

    // 없다면 지역 데이터 추가
    if (!regionData) {
      regionData = await Region.create({ province, district }, { transaction });
    }

    // `map` 테이블에서 위도/경도로 위치 찾기
    let mapData = await Map.findOne(
      { where: { latitude, longitude } },
      { transaction }
    );

    // 없다면 새로운 위치 추가
    if (!mapData) {
      mapData = await Map.create(
        {
          latitude,
          longitude,
          address,
          road_address: roadAddress,
          placeName,
        },
        { transaction }
      );
    }

    // 상품 데이터 저장
    const newItem = await Item.create(
      {
        userId,
        categoryId: parseInt(categoryId, 10),
        regionId: regionData.id, // 지역 정보 저장
        mapId: mapData.id, // 위치 정보 저장
        title,
        price,
        status: "거래가능",
        detail,
        itemStatus: itemStatus || "중",
      },
      { transaction }
    );

    // 거래내역에도 추가
    await Transaction.create(
      {
        itemId: newItem.id,
        sellerId: userId, // 판매자 ID 저장
        buyerId: null, // 구매자는 아직 없으므로 NULL
        status: "available", // 거래 가능 상태로 초기화
        createAt: new Date(), // 거래 생성 시간
      },
      { transaction }
    );

    // 이미지 업로드 및 저장
    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map((file) => ({
        itemId: newItem.id,
        imageUrl: file.location, // AWS S3 URL
      }));

      await ItemImage.bulkCreate(imageRecords, { transaction });
    }

    // 트랜잭션 커밋 (모든 작업이 성공적으로 완료됨)
    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "상품이 등록되었습니다.",
      data: newItem,
    });
  } catch (error) {
    await transaction.rollback(); // 오류 발생 시 롤백
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "판매 글 등록 실패", error });
  }
};

//**판매 글 수정 */
// PATCH /api-server/item/:itemId
exports.updateItem = async (req, res) => {
  const transaction = await Item.sequelize.transaction();
  try {
    const { itemId } = req.params;
    const {
      categoryId,
      title,
      price,
      detail,
      itemStatus,
      latitude,
      longitude,
      placeName,
    } = req.body;

    const userId = req.user?.id || null;
    // 수정할 상품 조회
    const item = await Item.findOne({ where: { id: itemId }, transaction });
    if (!item) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "수정할 상품을 찾을 수 없습니다." });
    }

    // 상품 작성자와 현재 사용자가 일치하는지 검증
    if (item.userId !== userId) {
      await transaction.rollback();
      return res
        .status(403)
        .json({ success: false, message: "수정 권한이 없습니다." });
    }

    let regionData, mapData;
    // 좌표 정보가 제공되면 위치 정보 업데이트 진행
    if (latitude && longitude) {
      const { province, district, address, roadAddress } =
        await getAddressFromCoordinatesKakao(latitude, longitude);

      if (!province || !district) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "위치 정보를 가져올 수 없습니다.",
        });
      }

      // 기존 지역 정보 조회 또는 생성
      regionData = await Region.findOne({
        where: { province, district },
        transaction,
      });
      if (!regionData) {
        regionData = await Region.create(
          { province, district },
          { transaction }
        );
      }

      // 지도 정보 조회 또는 생성
      mapData = await Map.findOne({
        where: { latitude, longitude },
        transaction,
      });
      if (!mapData) {
        // 신규 생성 시 placeName도 포함
        mapData = await Map.create(
          {
            latitude,
            longitude,
            address,
            road_address: roadAddress,
            placeName: placeName || null,
          },
          { transaction }
        );
      } else {
        // 기존 map 데이터가 존재하면, placeName이 제공된 경우 업데이트
        if (placeName) {
          await mapData.update({ placeName }, { transaction });
        }
      }
    } else if (placeName) {
      // 좌표 정보는 변경되지 않았지만, placeName만 업데이트하는 경우
      if (item.mapId) {
        mapData = await Map.findOne({ where: { id: item.mapId }, transaction });
        if (mapData) {
          await mapData.update({ placeName }, { transaction });
        }
      }
    }

    // 업데이트할 필드 구성 (상품 테이블에는 placeName 컬럼이 없으므로 제외)
    const updateFields = {};
    if (categoryId) updateFields.categoryId = categoryId;
    if (title) updateFields.title = title;
    if (price) updateFields.price = price;
    if (detail !== undefined) updateFields.detail = detail;
    if (itemStatus) updateFields.itemStatus = itemStatus;

    // 좌표가 변경되었으면 region, map 정보 업데이트 (mapData가 존재할 경우)
    if (regionData) updateFields.regionId = regionData.id;
    if (mapData) updateFields.mapId = mapData.id;

    // 상품 정보 업데이트
    await item.update(updateFields, { transaction });

    // 이미지 업데이트 처리
    if (req.files && req.files.length > 0) {
      // 기존 이미지 삭제 (필요에 따라 기존 이미지를 유지하는 로직도 고려)
      await ItemImage.destroy({ where: { itemId: item.id }, transaction });

      // 새로운 이미지 기록 생성
      const imageRecords = req.files.map((file) => ({
        itemId: item.id,
        imageUrl: file.location, // AWS S3 URL 등
      }));
      await ItemImage.bulkCreate(imageRecords, { transaction });
    }

    // 모든 작업이 성공하면 커밋
    await transaction.commit();
    return res.status(200).json({
      success: true,
      message: "상품이 성공적으로 수정되었습니다.",
      data: item,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("상품 수정 에러:", error);
    return res
      .status(500)
      .json({ success: false, message: "상품 수정에 실패했습니다.", error });
  }
};

/** 전체 상품 조회 (카테고리, 지역, 거래 상태 필터링 추가 + 사용자 찜 여부 포함 + 무한 스크롤 적용) */
// GET /api-server/item/item
exports.getAllItems = async (req, res) => {
  try {
    const {
      categoryId,
      regionId,
      status,
      sortBy,
      page = 1,
      limit = 10,
    } = req.query;

    const userId = req.user?.id || null;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    // 1) where 필터
    const filter = {};
    if (categoryId && parseInt(categoryId, 10) > 0) {
      filter.categoryId = parseInt(categoryId, 10);
    }
    if (regionId && parseInt(regionId, 10) > 0) {
      filter.regionId = parseInt(regionId, 10);
    }

    // 2) status별로 HAVING 절을 원시 SQL(Sequelize.literal)로 정의
    let havingLiteral = null;
    if (status === "available") {
      havingLiteral = Sequelize.literal(
        "MAX(`Transactions`.`buyer_id`) IS NULL"
      );
    } else if (status === "completed") {
      havingLiteral = Sequelize.literal(
        "MAX(`Transactions`.`buyer_id`) IS NOT NULL"
      );
    }

    // 3) 전체 개수 구하기 (group+having) → count() 대신 findAll() 후 .length
    const forCountRows = await Item.findAll({
      where: filter,
      include: [
        { model: Transaction, attributes: [], required: false },
        { model: Region, attributes: [], required: false },
        { model: Category, attributes: [], required: false },
        { model: ItemImage, attributes: [], required: false },
      ],
      group: ["Item.id", "Region.id", "Category.id"],
      // having은 객체 대신 literal을 직접 넣어야 [object Object] 문제 없음
      having: havingLiteral || undefined,

      // 여기서는 id만 가져오면 됨
      attributes: ["id"],
    });
    const totalCount = forCountRows.length;

    // 4) 실제 데이터 조회 (limit, offset)
    const items = await Item.findAll({
      where: filter,
      include: [
        { model: Transaction, attributes: [], required: false },
        { model: Region, attributes: ["id", "district"], required: false },
        { model: Category, attributes: ["id", "category"], required: false },
        { model: ItemImage, attributes: [], required: false },
      ],
      attributes: [
        "id",
        "userId",
        "title",
        "price",
        "detail",
        "itemStatus",
        // 집계 결과가 필요하다면:
        [
          Sequelize.fn("MAX", Sequelize.col("Transactions.buyer_id")),
          "buyerId",
        ],
        [
          Sequelize.fn("MIN", Sequelize.col("ItemImages.image_url")),
          "imageUrl",
        ],
        "createdAt",
      ],
      group: ["Item.id", "Region.id", "Category.id"],
      having: havingLiteral || undefined, // <-- literal을 직접 사용
      subQuery: false,
      limit: limitNum,
      offset,
    });

    // 5) 좋아요 정보
    const itemIds = items.map((item) => item.id);

    const favoritesCount = await Favorite.findAll({
      where: { itemId: itemIds },
      attributes: [
        "itemId",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "favCount"],
      ],
      group: ["itemId"],
    });

    let userFavorites = [];
    if (userId) {
      userFavorites = await Favorite.findAll({
        where: { itemId: itemIds, userId },
        attributes: ["itemId"],
      });
    }

    // 6) 좋아요 count, isFavorite 매핑
    const favCountMap = favoritesCount.reduce((acc, fav) => {
      acc[fav.itemId] = fav.dataValues.favCount;
      return acc;
    }, {});

    const userFavSet = new Set(userFavorites.map((fav) => fav.itemId));

    let responseData = items.map((item) => {
      const plain = item.get({ plain: true });
      return {
        ...plain,
        favCount: favCountMap[item.id] || 0,
        isFavorite: userFavSet.has(item.id),
      };
    });

    // 7) 정렬
    if (sortBy === "popular") {
      responseData.sort((a, b) => b.favCount - a.favCount);
    } else {
      responseData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    // 8) hasMore
    const hasMore = offset + responseData.length < totalCount;

    return res.status(200).json({
      success: true,
      data: responseData,
      totalCount,
      hasMore,
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

/** 특정 상품 상세 조회 */
// GET /api-server/item/:itemId
exports.getItemDetail = async (req, res) => {
  try {
    const db = require("../model");
    const {
      Item,
      User,
      Category,
      Region,
      Map,
      ItemImage,
      Sequelize,
      Transaction,
      Favorite,
    } = db;

    const { itemId } = req.params;
    const userId = req.user?.id || null;

    const item = await Item.findOne({
      where: { id: itemId },
      attributes: [
        "id",
        "userId",
        "title",
        "price",
        "detail",
        "itemStatus",
        "categoryId",
        "regionId",
        "createdAt",
        [
          Sequelize.fn("GROUP_CONCAT", Sequelize.col("ItemImages.image_url")),
          "imageUrls",
        ],
        [
          Sequelize.fn("MAX", Sequelize.col("Transactions.buyer_id")),
          "buyerId",
        ],
        [
          Sequelize.literal(
            `(SELECT COUNT(*) FROM Favorite WHERE Favorite.item_id = Item.id)`
          ),
          "favCount",
        ],
        [
          Sequelize.literal(
            userId
              ? `(SELECT COUNT(*) FROM Favorite WHERE Favorite.item_id = Item.id AND Favorite.user_id = ${userId})`
              : "0"
          ),
          "isFavoriteCount",
        ],
      ],
      include: [
        {
          model: User,
          attributes: ["id", "nickname", "profileImg"], // ✅ User 정보 추가
          required: false,
        },
        {
          model: Region,
          attributes: ["id", "district"],
          required: false,
        },
        {
          model: Category,
          attributes: ["id", "category"],
          required: false,
        },
        {
          model: ItemImage,
          attributes: [],
          required: false,
        },
        {
          model: Map,
          attributes: ["address", "placeName"],
          required: false,
        },
        { model: Transaction, attributes: [], required: false },
      ],
      group: ["Item.id", "User.id", "Region.id", "Category.id", "Map.id"],
    });

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "상품을 찾을 수 없습니다." });
    }

    const plainItem = item.get({ plain: true });
    const { isFavoriteCount, imageUrls, User: sellerInfo, ...rest } = plainItem;
    const isFavorite = Number(isFavoriteCount) > 0;
    const isOwner = userId !== null && userId === plainItem.userId; // 로그인한 사용자와 판매자가 같은지 여부

    // 응답 데이터 정리
    const responseData = {
      ...rest,
      isFavorite,
      favCount: Number(plainItem.favCount),
      images: imageUrls ? imageUrls.split(",") : [],
      isOwner, //판매자가 로그인한 사용자와 동일한지 여부
    };

    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error fetching item details:", error);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

/** 상품 검색 */
// GET /api-server/items?keyword=검색어
exports.searchItems = async (req, res) => {
  try {
    const { keyword } = req.query;
    const userId = req.user?.id || null; // 로그인 여부 체크

    if (!keyword) {
      return res
        .status(200)
        .json({ success: true, message: "상품이 없습니다." });
    }

    const items = await Item.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } }, // 제목 검색
          { detail: { [Op.like]: `%${keyword}%` } }, // 상세 설명 검색
        ],
      },
      include: [
        { model: Category, attributes: ["id", "category"] }, // 카테고리 정보 추가
        { model: Region, attributes: ["id", "district"] }, // 지역 정보 추가
        {
          model: ItemImage,
          attributes: [],
          required: false,
        },
      ],
      attributes: [
        "id",
        "userId",
        "title",
        "price",
        "itemStatus",
        "detail",
        "categoryId",
        "regionId",
        "createdAt",
        // 여러 이미지를 하나의 문자열로 집계
        [
          Sequelize.fn("GROUP_CONCAT", Sequelize.col("ItemImages.image_url")),
          "imageUrls",
        ],
        // 전체 찜 개수 계산
        [
          Sequelize.literal(
            `(SELECT COUNT(*) FROM Favorite WHERE Favorite.item_id = Item.id)`
          ),
          "favCount",
        ],
        // 로그인 여부와 상관없이 전체 찜 개수를 다시 계산하여 isFavoriteCount로 사용
        [
          Sequelize.literal(
            `(SELECT COUNT(*) FROM Favorite WHERE Favorite.item_id = Item.id)`
          ),
          "isFavoriteCount",
        ],
      ],
      group: ["Item.id", "Category.id", "Region.id"],
    });

    // 검색 결과가 없는 경우 메시지 반환
    if (items.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "찾는 상품이 없습니다." });
    }

    // 응답 데이터 변환: isFavorite은 전체 찜 개수가 0보다 큰지 여부로 결정
    const responseData = items.map((item) => {
      const { isFavoriteCount, imageUrls, ...rest } = item.get({ plain: true });
      return {
        ...rest,
        isFavorite: Number(isFavoriteCount) > 0,
        images: imageUrls ? imageUrls.split(",") : [],
      };
    });

    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error searching items:", error);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

/** 상품 찜하기 */
// POST /api-server/item/favorites
exports.addToFavorites = async (req, res) => {
  try {
    const { itemId } = req.body; // 요청에서 userId, itemId 받기
    const userId = req.user?.id || null; //로그인 여부 체크

    console.log("userID:", userId);

    // 필수 값 확인
    if (!userId || !itemId) {
      return res
        .status(400)
        .json({ success: false, message: "유저 ID와 상품 ID가 필요합니다." });
    }

    // 해당 아이템이 존재하는지 확인
    const item = await Item.findByPk(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "존재하지 않는 상품입니다." });
    }

    // 이미 찜한 상품인지 확인
    const existingFavorite = await Favorite.findOne({
      where: { userId, itemId },
    });

    if (existingFavorite) {
      return res
        .status(409)
        .json({ success: false, message: "이미 찜한 상품입니다." });
    }

    // 찜하기 추가
    await Favorite.create({ userId, itemId });

    return res
      .status(201)
      .json({ success: true, message: "상품을 찜했습니다." });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

/** 상품 찜 취소 */
// DELETE /api-server/item/favorites/:itemId
exports.removeFromFavorites = async (req, res) => {
  try {
    console.log("Received DELETE request:", req.params);

    const { itemId } = req.params;
    const userId = req.user?.id || null; //로그인 여부 체크

    // 필수 값 확인
    if (!userId || !itemId) {
      return res
        .status(400)
        .json({ success: false, message: "유저 ID와 상품 ID가 필요합니다." });
    }

    // 찜한 상품 존재 여부 확인
    const favorite = await Favorite.findOne({
      where: { userId, itemId },
    });

    if (!favorite) {
      return res
        .status(404)
        .json({ success: false, message: "찜한 상품이 존재하지 않습니다." });
    }

    // 찜한 상품 삭제
    await Favorite.destroy({ where: { userId, itemId } });

    return res
      .status(200)
      .json({ success: true, message: "찜한 상품이 취소되었습니다." });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

/** 판매 글 삭제 */
// DELETE /api-server/item/:itemId
exports.deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id; // JWT 미들웨어를 통해 설정된 사용자 ID

    console.log("userID:", userId);

    // 1. 아이템 조회
    const item = await Item.findOne({ where: { id: itemId } });
    if (!item) {
      return res.status(404).json({ error: "해당 상품을 찾을 수 없습니다." });
    }

    // 2. 권한 확인: 요청한 사용자가 해당 상품의 등록자인지 확인
    if (item.userId !== userId) {
      return res.status(403).json({ error: "삭제 권한이 없습니다." });
    }

    // 3. 판매 완료 여부 확인 (transaction 테이블에서 `buyer_id`가 NULL이 아닌 경우 판매 완료)
    const transaction = await Transaction.findOne({
      where: { item_id: itemId, buyer_id: { [Op.ne]: null } }, // Op.ne: Not Equal (NULL이 아닌 값)
    });

    if (transaction) {
      return res
        .status(400)
        .json({ error: "이 상품은 이미 판매 완료되어 삭제할 수 없습니다." });
    }

    // 4. 아이템 삭제
    await item.destroy();
    return res.json({ message: "상품이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

/** 판매자 판매물품 조회 */
//  GET /api-server/soldItems
exports.getSoldItemsByUser = async (req, res) => {
  try {
    const sellerId = Number(req.query.sellerId);
    const page = Number(req.query.page) || 1;

    if (!sellerId || isNaN(sellerId)) {
      return res
        .status(400)
        .json({ message: "유효한 판매자 ID가 필요합니다." });
    }

    const limit = 10; // 한 페이지에 10개씩
    const offset = (page - 1) * limit;

    // 전체 판매 내역 개수 조회
    const totalCount = await Transaction.count({ where: { sellerId } });

    // 판매 내역 조회 (페이지네이션 적용)
    const soldItems = await Transaction.findAll({
      where: { sellerId },
      include: [
        {
          model: Item,
          attributes: ["id", "title", "price"],
          include: [
            {
              model: ItemImage,
              attributes: ["imageUrl"],
              required: false,
              limit: 1,
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // 상품이 없을 경우 처리
    if (!soldItems.length) {
      return res.status(404).json({
        success: false,
        message: "상품을 찾을 수 없습니다.",
        items: [],
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
      });
    }

    // 클라이언트 응답 데이터 변환
    return res.status(200).json({
      success: true,
      items: soldItems.map((transaction) => {
        const item = transaction.Item;
        return {
          id: item?.id || null,
          title: item?.title || "제목 없음",
          price: item?.price || 0,
          imageUrl:
            item?.ItemImages?.length > 0 ? item.ItemImages[0].imageUrl : null, // ✅ 대표 이미지 처리
        };
      }),
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    });
  } catch (error) {
    console.error("서버 오류:", error);
    return res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
};

/** 상품 거래 완료 */
// POST /api-server/item/complete
exports.completeItemTransaction = async (req, res) => {
  try {
    const { itemId, buyerId } = req.body;

    if (!itemId || !buyerId) {
      return res
        .status(400)
        .json({ message: "상품 ID와 구매자 ID가 필요합니다." });
    }

    // 해당 상품의 거래 내역 확인
    const transaction = await Transaction.findOne({
      where: { itemId },
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ message: "해당 상품의 거래 내역이 없습니다." });
    }

    // 거래 상태 변경 (판매 완료)
    await transaction.update({ buyerId });

    // 상품 상태도 "판매 완료"로 업데이트
    await Item.update({ status: "거래완료" }, { where: { id: itemId } });

    return res
      .status(200)
      .json({ success: true, message: "상품 거래가 완료되었습니다." });
  } catch (error) {
    console.error("거래 완료 오류:", error);
    return res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
};
