// src/pages/Register.js
import { useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import { Card, Button, Form } from "react-bootstrap";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const submit = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      await API.post("/register", form);
      toast.success("Voter registered successfully");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <Card style={{ width: "22rem" }}>
        <Card.Body>
          <Card.Title className="mb-3 text-center">Voter Registration</Card.Title>

          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Control
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </Form.Group>

          <Button
            variant="success"
            className="w-100"
            onClick={submit}
          >
            Register
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}
