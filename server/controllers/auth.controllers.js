import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// hash password once at startup
const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);

export const login = async (req, res) => {
  const { password } = req.body;

  const valid = await bcrypt.compare(password, hashedPassword);
  if (!valid) {
    return res.status(401).json("Invalid credentials");
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
};