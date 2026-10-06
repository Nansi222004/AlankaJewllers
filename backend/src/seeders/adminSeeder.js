require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

const seed = async () => {
  await connectDB();
  let admin = await User.findOne({ role: "admin" });
  const email = (process.env.ADMIN_EMAIL || "admin@Alankarrjewellers.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Super Admin";
  const hashed = await bcrypt.hash(password, 12);

  if (admin) {
    admin.email = email;
    admin.name = name;
    admin.password = hashed;
    await admin.save();
    console.log("Admin updated successfully:", email);
  } else {
    await User.create({
      name,
      phone: "+91 8668821446",
      email,
      password: hashed,
      role: "admin",
    });
    console.log("Admin created successfully:", email);
  }
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
