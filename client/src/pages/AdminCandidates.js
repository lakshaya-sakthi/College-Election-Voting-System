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

  const [uploadType, setUploadType] = useState("url"); // url | file

  const [form, setForm] = useState({
    name: "",
    photo: "",     // for URL
    file: null,    // for uploaded file
    description: "",
    position: ""
  });

  const [editingId, setEditingId] = useState(null);

  // ================= LOAD DATA =================

  const loadCandidates = async () => {
    try {
      const res = await API.get("/admin/candidates");
      setCandidates(res.data);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to load candidates");
    }
  };

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

  // ================= SUBMIT =================

  const submitCandidate = async () => {
    if (!form.name || !form.description || !form.position) {
      toast.error("All required fields must be filled");
      return;
    }

    if (uploadType === "url" && !form.photo) {
      toast.error("Photo URL is required");
      return;
    }

    if (uploadType === "file" && !form.file) {
      toast.error("Please upload an image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("position", form.position);

      if (uploadType === "url") {
        formData.append("photo", form.photo);
      } else {
        formData.append("photo", form.file);
      }

      if (editingId) {
        await API.put(`/admin/candidates/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Candidate updated");
      } else {
        await API.post("/admin/candidates", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Candidate added");
      }

      cancelEdit();
      loadCandidates();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to save candidate");
    }
  };

  // ================= EDIT =================

  const editCandidate = (c) => {
    setForm({
      name: c.name,
      photo: c.photo || "",
      file: null,
      description: c.description,
      position: c.position?._id || ""
    });

    setUploadType("url"); // default to URL when editing
    setEditingId(c._id);
  };

  // ================= DELETE =================

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

  // ================= RESET =================

  const cancelEdit = () => {
    setForm({
      name: "",
      photo: "",
      file: null,
      description: "",
      position: ""
    });
    setEditingId(null);
    setUploadType("url");
  };

  // ================= UI =================

  return (
    <div className="container mt-4">
      <Row className="justify-content-center">
        <Col md={8}>

          {/* ===== Add / Edit Candidate ===== */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>
                Candidate Management{" "}
                {editingId && <Badge bg="warning">Editing</Badge>}
              </Card.Title>

              {/* Name */}
              <Form.Group className="mb-2">
                <Form.Control
                  placeholder="Candidate Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </Form.Group>

              {/* Upload Type Selector */}
              <Form.Group className="mb-2">
                {/* <Form.Label className="text-dark">Photo Type</Form.Label> */}
                <Form.Select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                >
                  <option value="url">Photo URL</option>
                  <option value="file">Upload Image</option>
                </Form.Select>
              </Form.Group>

              {/* URL OR FILE */}
              {uploadType === "url" ? (
                <Form.Group className="mb-2">
                  <Form.Control
                    placeholder="Photo URL"
                    value={form.photo}
                    onChange={(e) =>
                      setForm({ ...form, photo: e.target.value })
                    }
                  />
                </Form.Group>
              ) : (
                <Form.Group className="mb-2">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setForm({ ...form, file: e.target.files[0] })
                    }
                  />
                </Form.Group>
              )}

              {/* Preview */}
              {uploadType === "file" && form.file && (
                <img
                  src={URL.createObjectURL(form.file)}
                  alt="Preview"
                  height="100"
                  className="mb-2"
                />
              )}

              {/* Description */}
              <Form.Group className="mb-2">
                <Form.Control
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Form.Group>

              {/* Position */}
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

          {/* ===== Candidate List ===== */}
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Existing Candidates</Card.Title>

              {candidates.length === 0 && (
                <div className="text-muted text-center">
                  No candidates found
                </div>
              )}

              {candidates.map((c) => (
                <Card key={c._id} className="my-2 p-2 bg-light border-0">
                  <div className="d-flex justify-content-between align-items-center">

                    <div className="d-flex align-items-center gap-3">
                      {c.photo && (
                        <img
                          src={c.photo.startsWith("http")
                            ?c.photo
                            :`http://localhost:5000${c.photo}`
                          }
                          alt={c.name}
                          height="60"
                          width="60"
                          style={{ objectFit: "cover", borderRadius: "8px" }}
                        />
                      )}

                      <div>
                        <strong>{c.name}</strong>{" "}
                        <Badge bg="info" className="ms-2">
                          {c.position?.name || "No position"}
                        </Badge>
                        <div className="text-muted small">
                          {c.description}
                        </div>
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
