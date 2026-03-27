const { upload } = require("../config/cloudinary");
module.exports = upload.single("coverImage");