#!/usr/bin/env node

/**
 * =============================================================
 * UNIVERSAL BACKEND GENERATOR v4
 * Express + MongoDB + Optional Auth + File Upload
 * Scalable structure with modular config and clean separation
 * =============================================================
 */

import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import * as style from "./style.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.clear();
style.showBanner();

// -------------------------------------------------------------
// 1️⃣ ASK QUESTIONS
// -------------------------------------------------------------
const answers = await inquirer.prompt([
  {
    type: "input",
    name: "projectName",
    message: style.prompt("Project name:"),
    default: "my-backend",
    validate: (input) =>
      input.trim() !== "" || style.error("Project name cannot be empty."),
  },
  {
    type: "confirm",
    name: "includeAuth",
    message: style.prompt("Include Authentication (JWT login/register)?"),
    default: true,
  },
  {
    type: "confirm",
    name: "includeFileUpload",
    message: style.prompt("Enable File Upload feature (Multer)?"),
    default: false,
  },
  {
    type: "confirm",
    name: "includeEnv",
    message: style.prompt("Use .env for Mongo URI and configuration?"),
    default: true,
  },
]);

// -------------------------------------------------------------
// 2️⃣ CREATE PROJECT STRUCTURE
// -------------------------------------------------------------
console.log(style.step("Creating scalable folder structure..."));

const projectPath = path.join(process.cwd(), answers.projectName);
if (fs.existsSync(projectPath)) {
  console.log(style.error(`❌ Folder "${answers.projectName}" already exists.`));
  process.exit(1);
}

fs.mkdirSync(projectPath);
[
  "models",
  "routes",
  "controllers",
  "config",
  "middlewares",
  "utils",
  "uploads",
].forEach((folder) => fs.mkdirSync(path.join(projectPath, folder)));

console.log(style.info("📁 Folders ready."));

// -------------------------------------------------------------
// 3️⃣ PACKAGE.JSON
// -------------------------------------------------------------
const pkg = {
  name: answers.projectName,
  version: "1.0.0",
  type: "module",
  main: "server.js",
  scripts: {
    start: "node server.js",
    dev: "nodemon server.js",
  },
  dependencies: {
    express: "^4.21.1",
    mongoose: "^8.6.1",
  },
  devDependencies: {},
};

if (answers.includeEnv) pkg.dependencies.dotenv = "^16.4.5";
if (answers.includeAuth) pkg.dependencies.jsonwebtoken = "^9.0.0";
if (answers.includeFileUpload) pkg.dependencies.multer = "^1.4.5";

fs.writeFileSync(
  path.join(projectPath, "package.json"),
  JSON.stringify(pkg, null, 2)
);
console.log(style.info("🧾 package.json created."));

// -------------------------------------------------------------
// 4️⃣ CONFIG/DB.JS
// -------------------------------------------------------------
const dbContent = `import mongoose from "mongoose";

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
`;

fs.writeFileSync(path.join(projectPath, "config/db.js"), dbContent);

// -------------------------------------------------------------
// 5️⃣ SERVER.JS
// -------------------------------------------------------------
const serverCode = `import express from "express";
${answers.includeEnv ? `import dotenv from "dotenv";\ndotenv.config();` : ""}
import connectDB from "./config/db.js";

// Initialize Express app
const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Default route (can be used for health checks)
app.get("/", (req, res) => {
  res.send("✅ API is running fine");
});

// Import routes
import userRoutes from "./routes/userRoutes.js";
app.use("/api/users", userRoutes);
${answers.includeAuth ? `import authRoutes from "./routes/authRoutes.js";\napp.use("/api/auth", authRoutes);` : ""}
${answers.includeFileUpload ? `import uploadRoutes from "./routes/uploadRoutes.js";\napp.use("/api/upload", uploadRoutes);\napp.use("/uploads", express.static("uploads"));` : ""}

const PORT = ${answers.includeEnv ? "process.env.PORT || 3000" : "3000"};
app.listen(PORT, () =>
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`)
);
`;

fs.writeFileSync(path.join(projectPath, "server.js"), serverCode);

// -------------------------------------------------------------
// 6️⃣ .ENV FILE
// -------------------------------------------------------------
if (answers.includeEnv) {
  const envContent = `MONGO_URI=mongodb://localhost:27017/${answers.projectName}
PORT=3000
JWT_SECRET=supersecret`;
  fs.writeFileSync(path.join(projectPath, ".env"), envContent);
}

// -------------------------------------------------------------
// 7️⃣ .GITIGNORE
// -------------------------------------------------------------
fs.writeFileSync(
  path.join(projectPath, ".gitignore"),
  `node_modules\n.env\nuploads\n`
);

// -------------------------------------------------------------
// 8️⃣ USER CRUD MODULE
// -------------------------------------------------------------
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

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
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
const router = express.Router();
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/userController.js";

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
`
);

// -------------------------------------------------------------
// 9️⃣ AUTHENTICATION (OPTIONAL)
// -------------------------------------------------------------
if (answers.includeAuth) {
  fs.writeFileSync(
    path.join(projectPath, "controllers/authController.js"),
    `import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
};
`
  );

  fs.writeFileSync(
    path.join(projectPath, "routes/authRoutes.js"),
    `import express from "express";
const router = express.Router();
import { registerUser, loginUser } from "../controllers/authController.js";

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
`
  );
}

// -------------------------------------------------------------
// 🔟 FILE UPLOAD (OPTIONAL)
// -------------------------------------------------------------
if (answers.includeFileUpload) {
  fs.writeFileSync(
    path.join(projectPath, "routes/uploadRoutes.js"),
    `import express from "express";
import multer from "multer";
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
  res.json({ message: "File uploaded successfully", file: req.file });
});

export default router;
`
  );
}

// -------------------------------------------------------------
// ✅ DONE
// -------------------------------------------------------------
style.showSuccess(answers.projectName);
