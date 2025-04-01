module.exports = (Sequelize, DataTypes) => {
  const Map = Sequelize.define(
    "map",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
      },
      roadAddress: {
        type: DataTypes.STRING(255),
        field: "road_address",
      },
      placeName: {
        type: DataTypes.STRING(255),
        allowNull: true, // 사용자가 입력하지 않을 수도 있으므로 허용
        field: "place_name",
      },
    },
    {
      tableName: "map",
      timestamps: true,
    }
  );

  return Map;
};
