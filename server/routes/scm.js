const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

const authenticateToken = require("../middleware/authenticateToken"); // middleware xác thực token
const authorize = require("../middleware/authorizePermission")

router.get("/pos", authenticateToken, authorize("SCM_PO_view"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('po')
      .select('*');
    if (error) {
      console.error('Error fetching POs:', error);
    } else {
      console.log('Fetched POs:', data);
    }
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log('Fetched fail:', err);
  }
});
router.get("/vendors", authenticateToken, authorize("SCM_PO_view"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vendor')
      .select('vendor_id, vendor_name');
    if (error) {
      console.error('Error fetching Vendors:', error);
    } else {
      console.log('Fetched Vendors:', data);
    }
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log('Fetched fail:', err);
  }
});

router.get("/vendoritems", authenticateToken, authorize("SCM_PO_view"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vendor_item')
      .select('*');
    if (error) {
      console.error('Error fetching Vendor Items:', error);
    } else {
      console.log('Fetched Vendor Items:', data);
    }
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log('Fetched fail:', err);
  }
});
router.get("/senders", authenticateToken, authorize("SCM_PO_view"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sender')
      .select('sender_id, sender_name');
    if (error) {
      console.error('Error fetching Sender:', error);
    } else {
      console.log('Fetched Sender:', data);
    }
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log('Fetched fail:', err);
  }
});
router.get("/whs", authenticateToken, authorize("SCM_PO_view"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('warehouse')
      .select('wh_id, wh_name');
    if (error) {
      console.error('Error fetching WH:', error);
    } else {
      console.log('Fetched WH:', data);
    }
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log('Fetched fail:', err);
  }
});
router.get("/products", authenticateToken, authorize("SCM_Products_view"), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vendor_item')
      .select('*, vendor(vendor_name)');
    if (error) {
      console.error('Error fetching POs:', error);
    } else {
      console.log('Fetched POs:', data);
    }
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.log('Fetched fail:', err);
  }
});
module.exports = router;