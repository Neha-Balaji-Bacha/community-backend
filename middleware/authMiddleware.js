import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  try {
    console.log("Cookies:", req.cookies);

    const token = req.cookies.token;

    // No token - not logged in (but not error)
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    // If user not found - invalid token
    if (!user) {
      return res.status(401).json({
        data: null,
        error: { message: "User not found" },
      });
    }

    //  password change check
    if (user.passwordChangedAt) {
      const changedTime = parseInt(user.passwordChangedAt.getTime() / 1000);

      if (decoded.iat < changedTime) {
        return res.status(401).json({
          data: null,
          error: { message: "Token expired due to password change" },
        });
      }
    }

    // attach user
    req.user = user;

    next();

  } catch (error) {
    console.log("Auth error:", error.message);

    return res.status(401).json({
      data: null,
      error: { message: "Invalid token" },
    });
  }
};