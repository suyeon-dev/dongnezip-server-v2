module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    "Transaction",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: true, // 상품 삭제 시 NULL 허용
        field: "item_id",
      },
      sellerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "seller_id",
      },
      buyerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "buyer_id",
      },
    },
    {
      tableName: "transaction",
      timestamps: true, // createdAt, updatedAt 자동 생성
    }
  );

  return Transaction;
};
