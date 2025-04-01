module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: "카테고리명",
      },
    },
    {
      tableName: "category",
      timestamps: true, // createdAt, updatedAt 자동 생성
    }
  );

  return Category;
};
