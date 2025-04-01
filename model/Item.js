"use strict";

module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define(
    "Item",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      //판매자
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "category_id",
      },
      regionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "region_id",
      },
      mapId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "map_id",
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      detail: {
        type: DataTypes.TEXT,
      },
      itemStatus: {
        type: DataTypes.ENUM("새상품", "최상", "상", "중", "하"),
        allowNull: false,
        defaultValue: "중",
        field: "item_status",
      },
    },
    {
      tableName: "item",
      timestamps: true,
    }
  );

  return Item;
};
