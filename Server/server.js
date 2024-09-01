const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// CORS Middleware Configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: ["GET", "POST"], // Allow these methods
    credentials: true, // Allow cookies and authentication headers
  })
);

// Socket.io CORS Configuration
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: ["GET", "POST"], // Allow these methods
    credentials: true, // Allow cookies and authentication headers
  },
});

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose.connect(
  "YOUR_MONGODB_CONNECTION_URL",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
});
const User = mongoose.model("User", UserSchema);

// Message Schema
const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  room: { type: String },
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", MessageSchema);

// File Upload Setup
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Ensure this path is correct
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
});

// Socket.IO Logic
const users = {};
io.on("connection", (socket) => {
  console.log("A user connected");

  const username = socket.handshake.query.username;

  // Register new user if not already in the database
  User.findOne({ username }).then(async (existingUser) => {
    if (!existingUser) {
      const newUser = new User({ username });
      await newUser.save();
    }

    users[username] = socket.id;
    io.emit("userPresence", users);

    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
      Message.find({ room })
        .sort("createdAt")
        .populate("sender", "username")
        .then((messages) => {
          socket.emit("loadMessages", messages);
        });
    });

    socket.on("message", async (data) => {
      try {
        const user = await User.findOne({ username: data.sender });

        if (!user) {
          return console.error(`User with username ${data.sender} not found`);
        }

        const message = new Message({
          content: data.content,
          sender: user._id, // Use ObjectId from the user document
          room: data.room,
        });

        await message.save();

        const populatedMessage = await Message.findById(message._id).populate(
          "sender",
          "username"
        );
        io.to(data.room).emit("message", populatedMessage);
      } catch (error) {
        console.error("Error handling message:", error.message);
      }
    });

    socket.on("disconnect", () => {
      delete users[username];
      io.emit("userPresence", users);
      console.log("User disconnected");
    });
  });
});

// Endpoints
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ filePath });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/messages/:room", async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .sort("createdAt")
      .populate("sender", "username");
    res.json(messages);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// endpoint to add or update user
app.post("/user", async (req, res) => {
  const { username } = req.body;

  try {
    // Check if the user exists
    let user = await User.findOne({ username });

    if (!user) {
      // If the user doesn't exist, create a new user
      user = new User({ username });
      await user.save();
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
