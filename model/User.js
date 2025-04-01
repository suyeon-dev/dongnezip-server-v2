module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: "id",
      },
      email: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
        field: "email",
      },
      provider: {
        type: DataTypes.ENUM("local", "kakao"),
        allowNull: false,
        defaultValue: "local",
        field: "provider",
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "password",
      },
      name: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "name",
      },
      nickname: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: "nickname",
      },
      profileImg: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: "profile_img",
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
    }
  );
  return User;
};
