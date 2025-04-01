module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define(
    "Favorite", // 모델명 변경
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      //찜한 사용자
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "item_id",
      },
    },
    {
      tableName: "favorite", // 테이블명 변경
      timestamps: true, // createdAt, updatedAt 자동 생성
      indexes: [
        {
          unique: true,
          fields: ["user_id", "item_id"], // 한 사용자가 같은 상품을 중복 찜하지 못하도록 설정
        },
      ],
    }
  );

  return Favorite;
};
