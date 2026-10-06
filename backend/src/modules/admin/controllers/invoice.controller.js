/**
 * 🧾 Admin Tax Invoice Controller
 *    Generates official, GST-compliant Alankarr Jewellers Tax Invoices.
 *    Reads tax configuration, store GSTIN, state code, and HSN dynamically from Setting model.
 */

const mongoose = require("mongoose");
const Order = require("../../../models/Order");
const Setting = require("../../../models/Setting");
const { success, error } = require("../../../utils/apiResponse");

// Helper: convert number to Indian currency words
function numberToWords(num) {
  if (!num || isNaN(num)) return "Zero Rupees Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const formatChunk = (n) => {
    let str = "";
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + " ";
    }
    return str.trim();
  };

  const whole = Math.floor(num);
  const fraction = Math.round((num - whole) * 100);

  let result = "";
  const crore = Math.floor(whole / 10000000);
  const lakh = Math.floor((whole % 10000000) / 100000);
  const thousand = Math.floor((whole % 100000) / 1000);
  const remainder = whole % 1000;

  if (crore > 0) result += formatChunk(crore) + " Crore ";
  if (lakh > 0) result += formatChunk(lakh) + " Lakh ";
  if (thousand > 0) result += formatChunk(thousand) + " Thousand ";
  if (remainder > 0) result += formatChunk(remainder) + " ";

  result = (result.trim() || "Zero") + " Rupees";
  if (fraction > 0) {
    result += " and " + formatChunk(fraction) + " Paise";
  }
  return result + " Only";
}

exports.getOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return error(res, "Order not found", 404);
    }

    const [order, settings] = await Promise.all([
      Order.findById(id).populate("items.productId", "name sku metalType purity grossWeight netWeight images"),
      Setting.findOne(),
    ]);

    if (!order) return error(res, "Order not found", 404);

    // If customer is requesting, verify they own the order
    const currentUserId = req.user?.userId || req.user?._id || req.user?.id;
    if (req.user?.role === "user" && String(order.userId || "") !== String(currentUserId || "")) {
      return error(res, "Unauthorized to view this invoice", 403);
    }

    const storeState = (settings?.state || "Maharashtra").trim().toLowerCase();
    const storeStateCode = settings?.stateCode || "27";

    const customerAddr = order.shippingAddress || {};
    const customerState = (customerAddr.state || "Maharashtra").trim().toLowerCase();

    // Determine Intra-State vs Inter-State supply
    const isIntraState = !customerAddr.state || storeState === customerState;
    // Calculate item breakdowns
    const totalOrderAmount = Number(order.total || 0);
    const shippingFee = Number(order.shipping || 0);
    const discount = Number(order.discount || 0);

    // If order items have pre-calculated tax or total:
    let totalTaxableValue = 0;
    let totalTaxAmount = 0;
    let totalPgCharge = 0;

    const items = (order.items || []).map((item, index) => {
      const unitPrice = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      const grossLine = unitPrice * qty;
      const hasSnapshot = Number(item.pricingSnapshotVersion || 0) >= 1;
      const snapshot = hasSnapshot ? (item.pricingSnapshot?.toObject?.() || item.pricingSnapshot || {}) : null;
      // Legacy orders did not persist their pricing inputs. Keep their immutable
      // gross amount and avoid applying today's GST rate to historical sales.
      const gstRate = hasSnapshot ? Number(snapshot.gstRate || 0) : 0;
      const taxableValue = hasSnapshot
        ? Math.round(Number(snapshot.taxableSubtotal || 0) * qty * 100) / 100
        : Math.round(grossLine * 100) / 100;
      const taxAmount = hasSnapshot
        ? Math.round(Number(snapshot.gstAmount || 0) * qty * 100) / 100
        : 0;
      const cgstRate = isIntraState ? gstRate / 2 : 0;
      const sgstRate = isIntraState ? gstRate / 2 : 0;
      const igstRate = isIntraState ? 0 : gstRate;
      totalTaxableValue += taxableValue;
      totalTaxAmount += taxAmount;
      totalPgCharge += hasSnapshot
        ? Math.round(Number(snapshot.pgChargeAmount || 0) * qty * 100) / 100
        : 0;

      const product = item.productId || {};
      return {
        srNo: index + 1,
        name: item.name || product.name || "Jewelry Item",
        sku: item.sku || product.sku || "-",
        metalType: snapshot?.metal || product.metalType || "Gold / Silver",
        purity: snapshot?.purity || product.purity || "925 Sterling / 22K",
        grossWeight: snapshot
          ? `${snapshot.weight || 0} ${snapshot.weightUnit || "Grams"}`
          : product.grossWeight
            ? `${product.grossWeight}g`
            : "-",
        hsnCode: settings?.hsnCode || "7113",
        quantity: qty,
        unitPrice,
        pricingSnapshotVersion: Number(item.pricingSnapshotVersion || 0),
        pricingSnapshot: snapshot,
        taxableValue,
        cgstRate,
        cgstAmount: isIntraState ? Math.round((taxAmount / 2) * 100) / 100 : 0,
        sgstRate,
        sgstAmount: isIntraState ? Math.round((taxAmount / 2) * 100) / 100 : 0,
        igstRate,
        igstAmount: isIntraState ? 0 : taxAmount,
        totalAmount: grossLine,
      };
    });

    const prefix = settings?.invoicePrefix || "SS";
    const orderIdentifier = order.orderId || order._id.toString().slice(-6).toUpperCase();
    const invoiceNumber = `INV-${prefix}-${orderIdentifier}`;

    const snapshotRates = items
      .filter((item) => item.pricingSnapshotVersion >= 1)
      .map((item) => Number(item.pricingSnapshot?.gstRate || 0));
    const gstRates = [...new Set(snapshotRates)];
    const invoiceGstRate = gstRates.length === 1 ? gstRates[0] : null;
    const cgstRate = isIntraState && invoiceGstRate !== null ? invoiceGstRate / 2 : 0;
    const sgstRate = isIntraState && invoiceGstRate !== null ? invoiceGstRate / 2 : 0;
    const igstRate = !isIntraState && invoiceGstRate !== null ? invoiceGstRate : 0;

    const invoiceData = {
      invoiceNumber,
      invoiceDate: order.createdAt || new Date(),
      orderId: order.orderId || order._id.toString(),
      orderDate: order.createdAt,
      paymentMethod: (order.paymentMethod || "Prepaid").toUpperCase(),
      paymentStatus: (order.paymentStatus || "Paid").toUpperCase(),

      store: {
        name: settings?.storeName || "Alankarr Jewellers",
        tagline: settings?.tagline || "Where Luxury Meets Identity",
        address: settings?.address || "Alankarr Jewellers, Sarafa Lane Gandhi Chowk Wani, 445304, Maharashtra",
        email: settings?.email || "swarna.sparsh22@gmail.com",
        phone: settings?.phone || "+91 8668821446",
        website: settings?.website || "https://Alankarr-jewellers.com/",
        gstin: settings?.gstin || "27AABCU9603R1ZM",
        pan: settings?.pan || "AABCU9603R",
        state: settings?.state || "Maharashtra",
        stateCode: storeStateCode,
        hsnCode: settings?.hsnCode || "7113",
        bisHallmarkLicense: settings?.bisHallmarkLicense || "HM/C-7590214818",
      },

      customer: {
        name: [customerAddr.firstName, customerAddr.lastName].filter(Boolean).join(" ") || order.customerName || "Valued Customer",
        phone: customerAddr.phone || order.customerPhone || "-",
        email: order.customerEmail || "-",
        shippingAddress: [customerAddr.flatNo, customerAddr.area, customerAddr.city, customerAddr.state, customerAddr.pincode].filter(Boolean).join(", "),
        city: customerAddr.city || "-",
        state: customerAddr.state || "Maharashtra",
        pincode: customerAddr.pincode || "-",
      },

      taxSummary: {
        gstRate: invoiceGstRate,
        isIntraState,
        cgstRate,
        sgstRate,
        igstRate,
        totalTaxableValue: Math.round(totalTaxableValue * 100) / 100,
        cgstTotal: isIntraState ? Math.round((totalTaxAmount / 2) * 100) / 100 : 0,
        sgstTotal: isIntraState ? Math.round((totalTaxAmount / 2) * 100) / 100 : 0,
        igstTotal: isIntraState ? 0 : Math.round(totalTaxAmount * 100) / 100,
        totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
      },

      items,
      subtotal: Math.round(totalTaxableValue * 100) / 100,
      merchandiseSubtotal: Number(order.subtotal || 0),
      shippingFee,
      discount,
      pgCharge: Math.round(totalPgCharge * 100) / 100,
      giftWrapCharge: Number(order.giftWrapCharge || 0),
      giftCardDiscount: Number(order.giftCardDiscount || 0),
      couponCode: order.couponCode || "",
      grandTotal: totalOrderAmount,
      grandTotalInWords: numberToWords(totalOrderAmount),
    };

    return success(res, { invoice: invoiceData }, "Invoice prepared successfully");
  } catch (err) {
    console.error("[Invoice] Failed to generate invoice:", err.message);
    return error(res, err.message, 500);
  }
};
