export const registerUser = (req, res) => {
  const { name, password } = req.body;

  console.log("👤 Зарегистрирован:", name);
  res.status(200).json({ message: "User registered!" });
};
