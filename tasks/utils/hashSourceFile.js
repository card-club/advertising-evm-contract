const fs = require("fs");
const keccak256 = require("keccak");

function hashSourceFile(filePath) {
  let data = fs.readFileSync(filePath);
  let hash = keccak256("keccak256").update(data).digest("hex");
  return "0x" + hash;
}

module.exports = {
  hashSourceFile,
};
