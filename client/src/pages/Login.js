// src/pages/Login.js
import { useEffect, useState, useContext, useRef } from "react";
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

  const googleBtnRef = useRef(null);

  const submit = async () => {
    try {
      const res = await API.post("/login", { email, password });
      login(res.data.token, res.data.role);
      navigate(res.data.role === "admin" ? "/admin" : "/vote");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Login failed");
    }
  };

  // ✅ Google button init
  useEffect(() => {
    // global google from the script
    if (!window.google || !googleBtnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          // Send google ID token to backend
          const res = await API.post("/auth/google", {
            credential: response.credential
          });

          login(res.data.token, res.data.role);
          toast.success("Signed in with Google");

          navigate(res.data.role === "admin" ? "/admin" : "/vote");
        } catch (err) {
          toast.error(err.response?.data?.msg || "Google login failed");
        }
      }
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "filled_blue", // outline | filled_blue | filled_black
      size: "large",        // small | medium | large
      text: "continue_with",  // signin_with | signup_with | continue_with
      shape: "pill",        // rectangular | pill | circle | square
      width: 320
    });
  }, [login, navigate]);

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <Card style={{ width: "22rem" }} className="glass-card">
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

          <Button className="w-100 mb-2" onClick={submit}>
            Login
          </Button>

          {/* ✅ Google Sign-In Button */}
          <div className="d-flex justify-content-center mb-2">
            <div ref={googleBtnRef} />
          </div>

          <p
            style={{ cursor: "pointer" }}
            className="text-center mb-0"
            onClick={() => navigate("/register")}
          >
            New User ?
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}
