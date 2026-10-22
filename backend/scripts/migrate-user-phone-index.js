require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");

async function migrate() {
  try {
    await connectDB();
    const collection = mongoose.connection.db.collection("users");
    const indexesBefore = await collection.indexes();
    console.log("Indexes before:", indexesBefore.map((i) => i.name));

    const phoneIndex = indexesBefore.find((i) => i.name === "phone_1");
    if (phoneIndex) {
      console.log("Dropping old phone_1 index...");
      await collection.dropIndex("phone_1");
      console.log("Dropped phone_1 successfully.");
    }

    console.log("Creating new partial unique index for phone...");
    await collection.createIndex(
      { phone: 1 },
      {
        name: "phone_1",
        unique: true,
        partialFilterExpression: { phone: { $type: "string", $gt: "" } },
      }
    );
    console.log("Created new partial unique index successfully.");

    const indexesAfter = await collection.indexes();
    console.log("Indexes after:", JSON.stringify(indexesAfter, null, 2));

    await mongoose.disconnect();
    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
