import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

function SupportBotPage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      const token = sessionStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/support-chat",
        { message },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const botMsg = { sender: "bot", text: res.data.reply };
      setChat((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: "Something went wrong. Please try again." },
      ]);
    }
  };

  // Scroll to bottom when chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <Box
      sx={{
        background: "#f4f6f8",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "650px",
          borderRadius: 2,
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          AI WhatsApp Support Bot
        </Typography>

        <Box
          sx={{
            border: "1px solid #eee",
            borderRadius: 2,
            height: "420px",
            overflowY: "auto",
            p: 2,
            mb: 2,
            background: "#fafafa",
          }}
        >
          {chat.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                mb: 1.5,
              }}
            >
              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  maxWidth: "80%",
                  background: msg.sender === "user" ? "#007bff" : "#e9ecef",
                  color: msg.sender === "user" ? "white" : "black",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.sender === "bot" ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                ) : (
                  msg.text
                )}
              </Paper>
            </Box>
          ))}
          <div ref={chatEndRef} />
        </Box>

        {/* Input area */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Ask about your order..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            multiline
            maxRows={4} // expands up to 4 lines
            variant="outlined"
            size="small"
          />
          <Button variant="contained" color="primary" onClick={sendMessage}>
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default SupportBotPage;