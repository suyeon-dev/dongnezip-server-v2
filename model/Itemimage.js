module.exports = (sequelize, DataTypes) => {
  const ItemImage = sequelize.define(
    "ItemImage",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "item_id",
      },
      imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "image_url",
      },
    },
    {
      tableName: "itemImage",
      timestamps: true, // createdAt, updatedAt 자동 생성
    }
  );

  return ItemImage;
};
