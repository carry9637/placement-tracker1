const { param } = require("express-validator");
const mongoose = require("mongoose");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const idParam = (name = "id") =>
  param(name).custom((value) => {
    if (!isObjectId(value)) {
      throw new Error(`Invalid ${name}`);
    }

    return true;
  });

module.exports = {
  idParam,
  isObjectId,
};
