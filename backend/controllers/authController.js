import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
const USERS_FILE = "users.json";

const users = new Map();

if (fs.existsSync(USERS_FILE)) {
  const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  data.forEach(([username, userData]) => {
    users.set(username, userData);
  });
}

const saveUsersToFile = () => {
  const data = Array.from(users.entries());
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
};

export const signUp = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing fields" });
  if (users.has(username))
    return res.status(409).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(username, { username, password: hashedPassword });
  saveUsersToFile();

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "7d" });
  res.status(201).json({ user: { username }, accessToken: token });
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  const user = users.get(username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "7d" });
  res.status(200).json({ user: { username }, accessToken: token });
};

export const checkAuth = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = users.get(decoded.username);
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json({ user: { username: user.username } });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
