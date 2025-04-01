const Sequelize = require("sequelize");
const db = {};
const fs = require("fs");
const path = require("path");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config.js")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 모델 등록
db.User = require("./User")(sequelize, Sequelize);
db.Region = require("./Region")(sequelize, Sequelize);
db.Category = require("./Category")(sequelize, Sequelize);
db.Map = require("./Map")(sequelize, Sequelize);
db.Item = require("./Item")(sequelize, Sequelize);
db.ItemImage = require("./ItemImage")(sequelize, Sequelize);
db.Favorite = require("./Favorite")(sequelize, Sequelize);
db.Transaction = require("./Transaction")(sequelize, Sequelize);
db.ChatMessage = require("./ChatMessage")(sequelize, Sequelize);
db.ChatRoom = require("./ChatRoom")(sequelize, Sequelize);

/** 테이블 관계 설정 **/

// 1) User → Item (1:N) - 사용자가 탈퇴하면 등록한 상품 삭제
db.User.hasMany(db.Item, {
  foreignKey: "userId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.Item.belongsTo(db.User, {
  foreignKey: "userId",
  targetKey: "id",
});

// 2) User → Transaction (판매자 관계)
db.User.hasMany(db.Transaction, {
  foreignKey: "seller_id",
  sourceKey: "id",
});
db.Transaction.belongsTo(db.User, {
  foreignKey: "seller_id",
  targetKey: "id",
});

// 3) User → Transaction (구매자 관계)
db.User.hasMany(db.Transaction, {
  foreignKey: "buyer_id",
  sourceKey: "id",
});
db.Transaction.belongsTo(db.User, {
  foreignKey: "buyer_id",
  targetKey: "id",
});

// 4) Item → ItemImage (1:N) - 상품이 삭제되면 이미지도 삭제
db.Item.hasMany(db.ItemImage, {
  foreignKey: "itemId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.ItemImage.belongsTo(db.Item, {
  foreignKey: "itemId",
  targetKey: "id",
});

// 5) Item → Favorite (1:N) - 상품이 삭제되면 찜 목록에서도 삭제
db.Item.hasMany(db.Favorite, {
  foreignKey: "itemId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.Favorite.belongsTo(db.Item, {
  foreignKey: "itemId",
  targetKey: "id",
});

// 6) Item → Transaction (1:N) - 상품이 삭제되면 거래내역도 삭제
db.Item.hasMany(db.Transaction, {
  foreignKey: "itemId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.Transaction.belongsTo(db.Item, {
  foreignKey: "itemId",
  targetKey: "id",
});

// 7) Item → ChatRoom (1:N) - 상품이 삭제되더라도 채팅방은 유지 (SET NULL)
db.Item.hasMany(db.ChatRoom, {
  foreignKey: "itemId",
  sourceKey: "id",
  onDelete: "SET NULL",
});
db.ChatRoom.belongsTo(db.Item, {
  foreignKey: "itemId",
  targetKey: "id",
});

// 8) User → Favorite (1:N) - 사용자가 탈퇴하면 찜 목록 삭제
db.User.hasMany(db.Favorite, {
  foreignKey: "userId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.Favorite.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });

// 9) User → ChatRoom (1:N) - 사용자가 탈퇴하면 관련 채팅방 삭제
db.User.hasMany(db.ChatRoom, {
  foreignKey: "userId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.ChatRoom.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });

// 10) User → ChatMessage (1:N) - 사용자가 탈퇴하면 보낸 메시지 삭제
db.User.hasMany(db.ChatMessage, {
  foreignKey: "userId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.ChatMessage.belongsTo(db.User, { foreignKey: "userId", targetKey: "id" });

// 11) ChatRoom → ChatMessage (1:N) - 채팅방이 삭제되면 메시지도 삭제
db.ChatRoom.hasMany(db.ChatMessage, {
  foreignKey: "roomId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.ChatMessage.belongsTo(db.ChatRoom, {
  foreignKey: "roomId",
  targetKey: "id",
});

// 12) Map → Item (1:1) - 상품이 삭제되면 지도 정보도 삭제
db.Map.hasOne(db.Item, {
  foreignKey: "mapId",
  sourceKey: "id",
  onDelete: "CASCADE",
});
db.Item.belongsTo(db.Map, {
  foreignKey: "mapId",
  targetKey: "id",
});

// 13) Category → Item (1:N) - 카테고리가 삭제되더라도 상품은 유지 (SET NULL)
db.Category.hasMany(db.Item, {
  foreignKey: "categoryId",
  sourceKey: "id",
  onDelete: "SET NULL",
});
db.Item.belongsTo(db.Category, {
  foreignKey: "categoryId",
  targetKey: "id",
});

// 14) Region → Item (1:N) - 지역이 삭제되면 상품도 삭제
db.Region.hasMany(db.Item, {
  foreignKey: "regionId",
  onDelete: "CASCADE",
});
db.Item.belongsTo(db.Region, {
  foreignKey: "regionId",
  onDelete: "CASCADE",
});

module.exports = db;
