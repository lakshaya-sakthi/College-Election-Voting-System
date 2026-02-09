// src/pages/AdminCandidates.js
import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Badge
} from "react-bootstrap";

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [form, setForm] = useState({
    name: "",
    photo: "",
    description: "",
    position: ""
  });
  const [editingId, setEditingId] = useState(null);

  // Load candidates
  const loadCandidates = async () => {
    try {
      const res = await API.get("/admin/candidates");
      setCandidates(res.data);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to load candidates");
    }
  };

  // Load positions
  const loadPositions = async () => {
    try {
      const res = await API.get("/admin/positions");
      setPositions(res.data);
    } catch {
      toast.error("Failed to load positions");
    }
  };

  useEffect(() => {
    loadCandidates();
    loadPositions();
  }, []);

  // Add / Update candidate
  const submitCandidate = async () => {
    if (!form.name || !form.photo || !form.description || !form.position) {
      toast.error("All fields are required");
      return;
    }

    try {
      if (editingId) {
        await API.put(`/admin/candidates/${editingId}`, form);
        toast.success("Candidate updated");
      } else {
        await API.post("/admin/candidates", form);
        toast.success("Candidate added");
      }

      setForm({
        name: "",
        photo: "",
        description: "",
        position: ""
      });
      setEditingId(null);
      loadCandidates();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to save candidate");
    }
  };

  // Edit candidate
  const editCandidate = (c) => {
    setForm({
      name: c.name,
      photo: c.photo,
      description: c.description,
      position: c.position?._id || ""
    });
    setEditingId(c._id);
  };

  // Delete candidate
  const deleteCandidate = async (id) => {
    try {
      await API.delete(`/admin/candidates/${id}`);
      toast.success("Candidate deleted");

      if (id === editingId) {
        cancelEdit();
      }

      loadCandidates();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to delete candidate");
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setForm({
      name: "",
      photo: "",
      description: "",
      position: ""
    });
    setEditingId(null);
  };

  return (
    <div className="container mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          {/* Add / Edit Candidate */}
          <Card className="mb-4 shadow-sm glass-card">
            <Card.Body>
              <Card.Title>
                Candidate Management{" "}
                {editingId && <Badge bg="warning">Editing</Badge>}
              </Card.Title>

              <Form.Group className="mb-2">
                <Form.Control
                  placeholder="Candidate Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Control
                  placeholder="Photo URL"
                  value={form.photo}
                  onChange={(e) =>
                    setForm({ ...form, photo: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Control
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Select
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                >
                  <option value="">Select Position</option>
                  {positions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button variant="success" onClick={submitCandidate}>
                  {editingId ? "Update Candidate" : "Add Candidate"}
                </Button>
                {editingId && (
                  <Button variant="secondary" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Candidate List */}
          <Card className="shadow-sm glass-card">
            <Card.Body>
              <Card.Title>Existing Candidates</Card.Title>

              {candidates.length === 0 && (
                <div className="text-muted text-center">
                  No candidates found
                </div>
              )}

              {candidates.map((c) => (
                <Card
                  key={c._id}
                  className="my-2 p-2 bg-light border-0"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{c.name}</strong>{" "}
                      <Badge bg="info" className="ms-2">
                        {c.position?.name || "No position"}
                      </Badge>
                      <div className="text-muted small">
                        {c.description}
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => editCandidate(c)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => deleteCandidate(c._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
