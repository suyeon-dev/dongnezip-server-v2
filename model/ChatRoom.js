module.exports = (sequelize, DataTypes) => {
  const ChatRoom = sequelize.define(
    "room",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "item_id",
      },
      chatHost: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "chat_host",
      },
      chatGuest: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "chat_guest",
      },
      guestNick: {
        type: DataTypes.STRING(255),
        field: "guest_nick",
      },
    },
    {
      tableName: "room",
      timestamps: true,
    }
  );

  return ChatRoom;
};
