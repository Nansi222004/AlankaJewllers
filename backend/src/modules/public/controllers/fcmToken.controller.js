const DeviceToken = require("../../../models/DeviceToken");
const User = require("../../../models/User");
const { verifyToken } = require("../../../config/jwt");
const { success, error } = require("../../../utils/apiResponse");

/**
 * Save FCM token
 * Endpoint: POST /api/v1/fcm-tokens/save
 * Payload supports:
 * { "token": "...", "platform": "web" }
 * or { "fcm_token": "...", "device_type": "web" }
 */
exports.saveToken = async (req, res) => {
  try {
    const rawToken = req.body.token || req.body.fcm_token || req.body.fcmToken;
    const rawPlatform = req.body.platform || req.body.device_type || "web";

    if (!rawToken || typeof rawToken !== "string" || !rawToken.trim()) {
      return error(res, "FCM token is required", 400);
    }

    const token = rawToken.trim();
    const normalizedPlatform = String(rawPlatform).toLowerCase().trim();
    const isMobile = ["mobile", "android", "ios"].includes(normalizedPlatform);
    const platform = isMobile ? normalizedPlatform : "web";

    let userId = null;

    // Optional user identification via Bearer auth header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = verifyToken(authHeader.split(" ")[1]);
        if (decoded && decoded.userId) {
          userId = decoded.userId;
        }
      } catch (e) {
        // Silently continue for unauthenticated/expired guest visitors
      }
    }

    // Upsert into DeviceToken model
    await DeviceToken.findOneAndUpdate(
      { token },
      {
        token,
        platform,
        userId: userId || null,
        lastActiveAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // If user is authenticated, link to User record as well
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        const tokenField = isMobile ? "fcmTokenMobile" : "fcmTokens";
        if (!user[tokenField]) user[tokenField] = [];
        if (!user[tokenField].includes(token)) {
          user[tokenField].push(token);
          if (user[tokenField].length > 5) {
            user[tokenField] = user[tokenField].slice(-5);
          }
          await user.save();
        }
      }
    }

    return success(
      res,
      {
        saved: true,
        platform,
        userId: userId || null,
      },
      "FCM token saved successfully"
    );
  } catch (err) {
    console.error("[FCM Token Save Error]:", err);
    return error(res, err.message || "Failed to save FCM token", 500);
  }
};

/**
 * Remove FCM token
 * Endpoint: POST /api/v1/fcm-tokens/remove or DELETE /api/v1/fcm-tokens
 */
exports.removeToken = async (req, res) => {
  try {
    const rawToken = req.body.token || req.body.fcm_token || req.body.fcmToken;
    if (!rawToken) return error(res, "FCM token is required", 400);

    const token = rawToken.trim();
    await DeviceToken.deleteOne({ token });

    // If auth header present, also remove from User model
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = verifyToken(authHeader.split(" ")[1]);
        if (decoded && decoded.userId) {
          await User.findByIdAndUpdate(decoded.userId, {
            $pull: { fcmTokens: token, fcmTokenMobile: token },
          });
        }
      } catch (e) {}
    }

    return success(res, {}, "FCM token removed successfully");
  } catch (err) {
    return error(res, err.message || "Failed to remove FCM token", 500);
  }
};
