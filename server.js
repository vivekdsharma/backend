const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/squidGameRegistration')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Define the schema
const registrationSchema = new mongoose.Schema({
  event: { type: String, required: true },
  teamName: { type: String, required: true },
  teamLeader: { type: String, required: true },
  phoneNo: { type: String, required: true },
  email: { type: String, required: true },
  rollNo: { type: String, required: true },
  members: {
    type: [String],
    validate: {
      validator: function (value) {
        // Filter out empty strings and ensure at least one member remains
        const nonEmptyMembers = value.filter((member) => member.trim() !== '');
        return nonEmptyMembers.length > 0;
      },
      message: 'At least one valid member name is required.',
    },
  },
});

// Create the model
const Registration = mongoose.model('Registration', registrationSchema);

// Routes
app.post('/register', async (req, res) => {
  try {
    console.log('Request received:', req.body);
    const { event, teamName, teamLeader, phoneNo, email, rollNo, members } = req.body;

    const newRegistration = new Registration({
      event,
      teamName,
      teamLeader,
      phoneNo,
      email,
      rollNo,
      members,
    });

    await newRegistration.save();
    console.log('Data saved successfully!');
    res.status(201).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
