const Notification = require("../models/Notification");

const createNotification = async ({ user, type, title, message = "", entityType = "", entityId = null, createdBy = null }) => {
  if (!user) return null;

  return Notification.create({
    user,
    type,
    title,
    message,
    entityType,
    entityId,
    createdBy,
  });
};

module.exports = {
  createNotification,
};
