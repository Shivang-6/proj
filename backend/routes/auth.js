import express from "express";
import passport from "passport";

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
    passport.authenticate("google", {
      successRedirect: process.env.CLIENT_URL
        ? process.env.CLIENT_URL.replace(/\/$/, '') + "/landing"
        : "http://localhost:5173/landing",
      failureRedirect: "/auth/login/failed"
    })
  );

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Login failed"
  });
});

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: req.user,
    });
  } else {
    res.status(403).json({ success: false, message: "Not authorized" });
  }
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  });
});

export default router;
