#!/usr/bin/env node

import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import * as style from "./style.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.clear();
console.log(style.title("\n🚀  Backend Generation in minuts (Express + MongoDB)\n"));


const { projectName, mongoURI } = await inquirer.prompt([
  {
    type: "input",
    name: "projectName",
    message: style.prompt("Project name:"),
    default: "my-backend",
    validate: (input) =>
      input.trim() !== "" || style.error("Project name cannot be empty."),
  },
  {
    type: "input",
    name: "mongoURI",
    message: style.prompt("MongoDB URI (press Enter for default):"),
    default: (answers) => `mongodb://localhost:27017/${answers.projectName}`,
  },
]);

const projectPath = path.join(process.cwd(), projectName);
if (fs.existsSync(projectPath)) {
  console.log(style.error(`Folder "${projectName}" already exists.`));
  process.exit(1);
}


console.log(style.step(`Creating project "${projectName}"...`));
fs.mkdirSync(projectPath);
["models", "routes", "controllers", "config", "middlewares", "utils"].forEach((folder) =>
  fs.mkdirSync(path.join(projectPath, folder))
);
console.log(style.folder("Folder structure created."));

const pkg = {
  name: projectName,
  version: "1.0.0",
  type: "module",
  main: "server.js",
  scripts: {
    start: "node server.js",
    dev: "node --watch server.js",
  },
  dependencies: {
    express: "^4.21.1",
    mongoose: "^8.6.1",
    dotenv: "^16.4.5",
  },
};
fs.writeFileSync(path.join(projectPath, "package.json"), JSON.stringify(pkg, null, 2));
console.log(style.info("🧾 package.json created."));

fs.writeFileSync(
  path.join(projectPath, "config/db.js"),
  `import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
`
);

fs.writeFileSync(
  path.join(projectPath, "server.js"),
  `import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.send("✅ API is running fine"));

import userRoutes from "./routes/userRoutes.js";
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`🚀 Server running on http://localhost:\${PORT}\`));
`
);


fs.writeFileSync(path.join(projectPath, ".env"), `MONGO_URI=${mongoURI}\nPORT=3000\n`);


fs.writeFileSync(
  path.join(projectPath, "models/User.js"),
  `import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number
}, { timestamps: true });

export default mongoose.model("User", userSchema);
`
);

fs.writeFileSync(
  path.join(projectPath, "controllers/userController.js"),
  `import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
`
);

fs.writeFileSync(
  path.join(projectPath, "routes/userRoutes.js"),
  `import express from "express";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();
router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
`
);

console.log(style.step("Installing dependencies..."));
execSync("npm install", { cwd: projectPath, stdio: "inherit" });

console.log(style.success(`\n🎉 Project "${projectName}" setup complete!`));
console.log(style.box(`\n📂 Next Steps:`));
console.log(style.info(`   cd ${projectName}`));
console.log(style.info(`   npm run dev\n`));
console.log(style.done(`🌐 Running on: http://localhost:3000\n`));
