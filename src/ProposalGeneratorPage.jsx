import { useState } from "react";
import axios from "axios";
import { Box, TextField, Button } from "@mui/material";

function ProposalGeneratorPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastProposal, setLastProposal] = useState(null);
  const [ordering, setOrdering] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setLoading(true);
    setLastProposal(null);

    try {
      const token = sessionStorage.getItem("token");

      const res = await axios.post(
        "https://fullstackai-suite.onrender.com/b2b-proposal",
        { request: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = res.data.result;

      const aiMessage = {
        role: "ai",
        content: result.error ? result.error : JSON.stringify(result, null, 2),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (!result.error) {
        setLastProposal(result);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Error contacting AI server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!lastProposal) return;

    setOrdering(true);

    try {
      const token = sessionStorage.getItem("token");

      await axios.post(
        "https://fullstackai-suite.onrender.com/create-order",
        { proposal: lastProposal },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `✅ Order created successfully!` },
      ]);

      setLastProposal(null);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "❌ Failed to create order." },
      ]);
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div
      style={{
        background: "#f4f6f8",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          width: "650px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          padding: "20px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "15px" }}>
          AI B2B Proposal Generator
        </h2>

        <div
          style={{
            border: "1px solid #eee",
            height: "420px",
            overflowY: "auto",
            padding: "15px",
            borderRadius: "10px",
            background: "#fafafa",
            marginBottom: "15px",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent:
                  msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  background: msg.role === "user" ? "#007bff" : "#e9ecef",
                  color: msg.role === "user" ? "white" : "black",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  maxWidth: "80%",
                  wordBreak: "break-word",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                  }}
                >
                  {msg.content}
                </pre>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  background: "#e9ecef",
                  padding: "10px 14px",
                  borderRadius: "12px",
                }}
              >
                AI is building proposal...
              </div>
            </div>
          )}
        </div>

        {lastProposal && (
          <div style={{ marginBottom: "15px", textAlign: "center" }}>
            <Button
              variant="contained"
              color="success"
              onClick={placeOrder}
              disabled={ordering}
            >
              {ordering ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        )}

        {/* Input area */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Example: Sustainable conference for 200 people, budget $5000"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            multiline
            maxRows={4}
            variant="outlined"
            size="small"
          />
          <Button variant="contained" color="primary" onClick={sendMessage}>
            Send
          </Button>
        </Box>
      </div>
    </div>
  );
}

export default ProposalGeneratorPage;