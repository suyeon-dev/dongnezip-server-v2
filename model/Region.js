module.exports = (sequelize, DataTypes) => {
  const Region = sequelize.define(
    "Region",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      province: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "시/도",
      },
      district: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "시/군/구",
      },
    },
    {
      tableName: "region",
      timestamps: true, // createdAt, updatedAt 자동 생성
      indexes: [
        {
          unique: true, // 시/도 + 시/군/구 중복 방지
          fields: ["province", "district"],
        },
      ],
    }
  );

  return Region;
};
