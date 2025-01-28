require("dotenv").config(); // Load environment variables from a .env file
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection URI from environment variables
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/squidGameRegistration";

// Enable mongoose debugging in development
mongoose.set("debug", process.env.NODE_ENV !== "production");

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB Atlas:", err.message);
    process.exit(1); // Exit the process on critical failure
  });

// Define the Schema
const registrationSchema = new mongoose.Schema({
  event: { type: String, required: true },
  teamName: { type: String, required: true },
  teamLeader: { type: String, required: true },
  phoneNo: {
    type: String,
    required: true,
    match: [/^\d{10}$/, "Phone number must be 10 digits long"], // Validate phone number
  },
  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"], // Validate email
  },
  rollNo: { type: String, required: true },
  members: {
    type: [String],
    validate: {
      validator: function (value) {
        return (
          value.length > 0 && value.every((member) => member.trim() !== "")
        );
      },
      message: "At least one valid team member name is required.",
    },
  },
});

// Create the Model
const Registration = mongoose.model("Registration", registrationSchema);

// Routes
app.post("/register", async (req, res) => {
  try {
    console.log("Request received:", req.body);
    const { event, teamName, teamLeader, phoneNo, email, rollNo, members } =
      req.body;

    // Validate required fields
    if (!event || !teamName || !teamLeader || !phoneNo || !email || !rollNo) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create and save the new registration
    const newRegistration = new Registration({
      event,
      teamName,
      teamLeader,
      phoneNo,
      email,
      rollNo,
      members,
    });
    res.status(201).json({ message: "Registration successful!" });
    await newRegistration.save();
    console.log("✅ Data saved successfully!");
    
  } catch (error) {
    console.error("❌ Error saving data:", error);
    res.status(500).json({
      message: "An error occurred while saving data. Please try again.",
    });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log("✅ Server is running on http://localhost:${PORT}");
});
