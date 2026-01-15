import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

const USERS_PATH = path.resolve("users.json");

if (!fs.existsSync(USERS_PATH)) {
    throw new Error("users.json not found. Copy from users.example.json .");
}

const USERS = JSON.parse(fs.readFileSync(USERS_PATH, "utf-8"));

for (const [name, user] of Object.entries(USERS)) {
  if (!user.passwordHash?.startsWith("$2")) {
    throw new Error(`User ${name} has invalid passwordHash`);
  }
}

function authenticate(username, password) {
    const user = USERS[username];
    if (!user) return false;
    return bcrypt.compareSync(password, user.passwordHash);
}

export { authenticate };
