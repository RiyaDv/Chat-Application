import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import {
  Container,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  Typography,
  Paper,
  Input,
  IconButton,
  ListItemText,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { grey, blue } from "@mui/material/colors";

const userColors = {
  light: {
    default: grey[200],
  },
  dark: {
    default: grey[800],
  },
};

const ChatApp = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [users, setUsers] = useState({});
  const [socket, setSocket] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Function to request notification permission
  const requestNotificationPermission = async () => {
    if (Notification.permission === "default") {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied.");
        }
      } catch (error) {
        console.error("Failed to request notification permission:", error);
      }
    }
  };

  // Function to show notification
  const showNotification = (title, options) => {
    if (Notification.permission === "granted") {
      new Notification(title, options);
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (username && room) {
      const newSocket = io("http://localhost:5000", {
        query: { username },
      });
      setSocket(newSocket);

      newSocket.on("message", (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);

        // Show notification for new message
        showNotification("New Message", {
          body: `${msg.sender.username}: ${msg.content}`,
          icon: "path/to/icon.png", // Optional: Path to an icon image
        });
      });

      newSocket.on("userPresence", (users) => {
        setUsers(users);
      });

      return () => newSocket.close();
    }
  }, [username, room]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const joinRoom = async () => {
    try {
      if (username && room) {
        // Check if the user exists or add the user if new
        const userResponse = await axios.post("http://localhost:5000/user", {
          username,
        });

        if (userResponse.data.success) {
          // Proceed with joining the room
          if (socket) {
            socket.emit("joinRoom", room);
            const response = await axios.get(
              `http://localhost:5000/messages/${room}`
            );
            setMessages(response.data);
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }
        } else {
          console.error(
            "Error adding or fetching user:",
            userResponse.data.message
          );
        }
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const sendMessage = () => {
    if (socket && message.trim()) {
      const msg = {
        content: message,
        room: room,
        sender: username,
      };
      socket.emit("message", msg);
      setMessage("");
    }
  };

  const uploadFile = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await axios.post(
          "http://localhost:5000/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const filePath = response.data.filePath;

        const msg = {
          content: `File uploaded: ${filePath}`,
          room: room,
          sender: username,
        };
        socket.emit("message", msg);
        setFile(null);
      } catch (error) {
        console.error("File upload error:", error);
      }
    }
  };

  useEffect(() => {
    if (file) {
      uploadFile();
    }
  }, [file]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("light-mode", !darkMode);
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? blue[400] : blue[600],
      },
      background: {
        default: darkMode ? "#121212" : "#f5f5f5",
        paper: darkMode ? "#1e1e1e" : "#ffffff",
      },
      text: {
        primary: darkMode ? "#e0e0e0" : "#000000",
        secondary: darkMode ? "#b0b0b0" : "#666666",
      },
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
          transition: "background-color 0.3s ease-in-out",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: "16px", 
            mt: 4, 
            boxShadow: `0px 6px 12px ${theme.palette.divider}`, 
            display: "flex",
            flexDirection: "column",
            flex: 1,
            p: 3, 
            transition: "box-shadow 0.3s ease-in-out",
            "&:hover": {
              boxShadow: `0px 8px 16px ${theme.palette.divider}`, 
            },
          }}
        >
          <Box
            mb={4}
            p={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            component={Paper}
            sx={{
              backgroundColor: theme.palette.background.paper,
              boxShadow: `0px 4px 8px ${theme.palette.divider}`,
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
              px: 3,
              py: 2,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: theme.palette.text.primary,
                letterSpacing: "0.5px",
                lineHeight: "1.2",
              }}
            >
              Chat Application
            </Typography>
            <IconButton
              color="primary"
              onClick={() => setDarkMode((prevMode) => !prevMode)}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "50%",
                p: 1,
                transition: "background-color 0.3s, box-shadow 0.3s",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  boxShadow: `0px 4px 8px ${theme.palette.divider}`,
                },
                "&:active": {
                  backgroundColor: theme.palette.action.selected,
                  boxShadow: `0px 2px 4px ${theme.palette.divider}`,
                },
              }}
            >
              {darkMode ? "🌞" : "🌙"}
            </IconButton>
          </Box>

          <Box
            component={Paper}
            p={4}
            elevation={3}
            sx={{
              backgroundColor: theme.palette.background.paper,
              mb: 2,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: "bold",
                color: theme.palette.text.primary,
                letterSpacing: "0.5px",
                lineHeight: "1.2",
                mb: 2,
                textAlign: "center",
              }}
            >
              Register & Join Chat Room
            </Typography>
            <Box display="flex" mb={2} alignItems="center">
              <TextField
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mr: 1, flex: 1 }}
              />
              <TextField
                label="Room"
                variant="outlined"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                sx={{ mr: 1, flex: 1 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={joinRoom}
                sx={{
                  boxShadow: 4,
                  borderRadius: "12px",
                  padding: "10px 20px",
                  textTransform: "none",
                  fontWeight: "bold",
                  letterSpacing: "0.5px",
                  "&:hover": {
                    boxShadow: 6,
                    backgroundColor: (theme) => theme.palette.primary.dark, 
                  },
                  "&:active": {
                    boxShadow: 1,
                    backgroundColor: (theme) => theme.palette.primary.light,
                  },
                  "&:focus": {
                    outline: "none",
                  },
                }}
              >
                Join Room
              </Button>
            </Box>

            {room && (
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  mb: 2,
                  textAlign: "center",
                  fontWeight: "bold",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.314)",
                }}
              >
                Chat History of {room}
              </Typography>
            )}
            {!room && (
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  mb: 2,
                  textAlign: "center",
                  fontWeight: "bold",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.314)",
                }}
              >
                Chat History
              </Typography>
            )}

            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                border: `1px solid ${theme.palette.divider}`,
                p: 2,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 4,
                mb: 2,
                maxHeight: "400px",
              }}
            >
              <List>
                {messages.map((msg, index) => {
                  // Default values in case of null or undefined (e.g Deleted User Messages)
                  const senderUsername = msg.sender?.username || "Unknown";
                  const messageColor =
                    userColors[darkMode ? "dark" : "light"][senderUsername] ||
                    userColors[darkMode ? "dark" : "light"].default;

                  return (
                    <ListItem
                      key={index}
                      sx={{
                        backgroundColor: messageColor,
                        color: theme.palette.text.primary,
                        borderRadius: 12,
                        mb: 1,
                        p: 1,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        display: "flex",
                        alignItems: "flex-start",
                      }}
                      divider
                    >
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold" }}
                          >
                            {senderUsername}
                          </Typography>
                        }
                        secondary={
                          msg.content.startsWith("File uploaded") ? (
                            <a
                              href={`http://localhost:5000${
                                msg.content.split(": ")[1]
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: theme.palette.text.primary }}
                            >
                              {msg.content.endsWith(".jpg") ||
                              msg.content.endsWith(".png") ||
                              msg.content.endsWith(".gif") ? (
                                <img
                                  src={`http://localhost:5000${
                                    msg.content.split(": ")[1]
                                  }`}
                                  alt="uploaded"
                                  style={{
                                    maxWidth: "200px",
                                    borderRadius: 4,
                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                  }}
                                />
                              ) : msg.content.endsWith(".mp4") ||
                                msg.content.endsWith(".webm") ? (
                                <video
                                  src={`http://localhost:5000${
                                    msg.content.split(": ")[1]
                                  }`}
                                  controls
                                  style={{
                                    maxWidth: "200px",
                                    borderRadius: 4,
                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                    display: "block",
                                    margin: "10px auto",
                                  }}
                                />
                              ) : (
                                msg.content
                              )}
                            </a>
                          ) : (
                            msg.content
                          )
                        }
                      />
                    </ListItem>
                  );
                })}
                <div ref={messagesEndRef} />
              </List>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              component={Paper}
              sx={{ p: 1 }}
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                fullWidth
                disableUnderline
                sx={{ ml: 1, mr: 1 }}
              />
              <IconButton color="primary" onClick={sendMessage} sx={{ p: 1 }}>
                <SendIcon />
              </IconButton>
              <IconButton color="primary" component="label" sx={{ p: 1 }}>
                <AttachFileIcon />
                <input
                  type="file"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </IconButton>
            </Box>
          </Box>
          <Box
            component={Paper}
            p={2}
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 4,
              boxShadow: 2,
              border: `1px solid ${theme.palette.divider}`,
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                mb: 2,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Users Online
            </Typography>
            <List>
              {Object.keys(users).map((user) => (
                <ListItem
                  key={user}
                  sx={{
                    borderRadius: 12,
                    mb: 1,
                    p: 1,
                    backgroundColor:
                      userColors[darkMode ? "dark" : "light"][user] ||
                      userColors[darkMode ? "dark" : "light"].default,
                    color: theme.palette.text.primary,
                  }}
                >
                  <ListItemText primary={user} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ChatApp;
