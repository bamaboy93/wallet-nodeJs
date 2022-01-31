const db = require("../config/db");
const app = require("../app");
require("dotenv").config();
const UPLOAD_DIR = process.env.UPLOAD_DIR;
const USERS_AVATARS = process.env.USERS_AVATARS;
const mkdirp = require("mkdirp");

const PORT = process.env.PORT || 5500;

db.then(() => {
  app.listen(PORT, async () => {
    await mkdirp(UPLOAD_DIR);
    await mkdirp(USERS_AVATARS);
    console.log(`Server running. Use our API on port: ${PORT}`);
  });
}).catch((err) => {
  console.log(`Server not run. Error: ${err.message}`);
});
