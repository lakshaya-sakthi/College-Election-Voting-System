// src/pages/Login.js
import { useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async () => {
    try {
      const res = await API.post("/login", { email, password });
      login(res.data.token, res.data.role);
      navigate(res.data.role === "admin" ? "/admin" : "/vote");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <Card style={{ width: "22rem" }}>
        <Card.Body>
          <Card.Title className="mb-3 text-center">Login</Card.Title>
          <Form.Group className="mb-2">
            <Form.Control
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Button className="w-100 mt-2" onClick={submit}>
            Login
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}
