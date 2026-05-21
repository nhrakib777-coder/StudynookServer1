import fetch from "node-fetch";
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* ---------------- GOOGLE LOGIN ---------------- */
router.get("/google", (req, res) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL } = process.env;

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(GOOGLE_CALLBACK_URL)}&` +
    `response_type=code&` +
    `scope=email%20profile`;

  res.redirect(url);
});

/* ---------------- GOOGLE CALLBACK ---------------- */
router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;

    /* 1. Exchange code for token */
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    /* 2. Get user info */
    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const googleUser = await userRes.json();

    /* 3. Create or find user */
    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        photo: googleUser.picture,
        password: null,
      });
    }

    /* 4. Create JWT */
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* 5. Set cookie (IMPORTANT FIX) */
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    /* 6. Redirect to FRONTEND (NO TOKEN IN URL) */
    const frontendURL =
      process.env.NODE_ENV === "production"
        ? "https://studynookclient.vercel.app"
        : "http://localhost:5173";

    return res.redirect(frontendURL);
  } catch (err) {
    console.error("Google Auth Error:", err);

    const frontendURL =
      process.env.NODE_ENV === "production"
        ? "https://studynookclient.vercel.app/login"
        : "http://localhost:5173/login";

    return res.redirect(frontendURL);
  }
});

export default router;