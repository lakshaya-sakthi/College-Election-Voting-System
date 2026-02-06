// src/pages/AdminPositions.js
import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import { Card, Button, Form, Row, Col, Badge } from "react-bootstrap";

export default function AdminPositions() {
  const [positions, setPositions] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const loadPositions = async () => {
    try {
      const res = await API.get("/admin/positions");
      setPositions(res.data);
    } catch {
      toast.error("Failed to load positions");
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const submitPosition = async () => {
    if (!name.trim()) {
      toast.error("Position name required");
      return;
    }

    try {
      if (editingId) {
        await API.put(`/admin/positions/${editingId}`, { name });
        toast.success("Position updated");
      } else {
        await API.post("/admin/positions", { name });
        toast.success("Position added");
      }

      setName("");
      setEditingId(null);
      loadPositions();
    } catch {
      toast.error("Failed to save position");
    }
  };

  const editPosition = (p) => {
    setName(p.name);
    setEditingId(p._id);
  };

  const deletePosition = async (id) => {
    try {
      await API.delete(`/admin/positions/${id}`);
      toast.success("Position deleted");

      if (id === editingId) {
        setName("");
        setEditingId(null);
      }

      loadPositions();
    } catch {
      toast.error("Failed to delete position");
    }
  };

  const cancelEdit = () => {
    setName("");
    setEditingId(null);
  };

  return (
    <div className="container mt-4">
      <Row className="justify-content-center">
        <Col md={6}>
          {/* Add / Edit Card */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>
                Position Management{" "}
                {editingId && <Badge bg="warning">Editing</Badge>}
              </Card.Title>

              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Enter position name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button variant="primary" onClick={submitPosition}>
                  {editingId ? "Update Position" : "Add Position"}
                </Button>

                {editingId && (
                  <Button variant="secondary" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Positions List */}
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="text-center">Existing Positions</Card.Title>

              {positions.length === 0 && (
                <div className="text-muted text-center">
                  No positions found
                </div>
              )}

              {positions.map((p) => (
                <Card
                  key={p._id}
                  className="p-2 my-2 border-0 bg-light"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{p.name}</strong>

                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => editPosition(p)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => deletePosition(p._id)}
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
