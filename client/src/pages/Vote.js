import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Badge
} from "react-bootstrap";

export default function Vote() {
  const [candidates, setCandidates] = useState([]);
  const [votedPositions, setVotedPositions] = useState([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await API.get("/vote/candidates");
        setCandidates(res.data);
      } catch (err) {
        toast.error(err.response?.data?.msg || "Election not started");
      }
    };
    fetchCandidates();
  }, []);

  const vote = async (candidateId, positionId) => {
    try {
      await API.post(`/vote/${candidateId}`);
      toast.success("Vote cast successfully");
      setVotedPositions([...votedPositions, positionId]);
    } catch {
      toast.error("You already voted for this position");
    }
  };

  return (
    <Container className="mt-4">
      <h3 className="text-center mb-4 fw-bold"> Cast Your Vote</h3>

      {candidates.length === 0 && (
        <div className="alert alert-warning text-center">
          No candidates available
        </div>
      )}

      {candidates.map((c) => {
        const voted = votedPositions.includes(c.position._id);

        return (
          <Card key={c._id} className="mb-3 shadow-sm">
            <Card.Body>
              <Row className="align-items-center">
                {/* Candidate Photo */}
                <Col md={2} className="text-center">
                  <img
  src={
    c.photo
      ? c.photo.startsWith("http")
        ? c.photo
        : `http://localhost:5000${c.photo}`
      : "https://via.placeholder.com/90"
  }
  alt={c.name}
  width="90"
  height="90"
  style={{ objectFit: "cover", borderRadius: "50%" }}
/>

                </Col>

                {/* Candidate Info */}
                <Col md={7}>
                  <h5 className="fw-bold mb-1 text-dark">{c.name}</h5>
                  <Badge bg="secondary" className="mb-2">
                    {c.position.name}
                  </Badge>
                  <p className="text-muted mb-0">{c.description}</p>
                </Col>

                {/* Vote Button */}
                <Col md={3} className="text-end">
                  <Button
                    variant={voted ? "secondary" : "success"}
                    disabled={voted}
                    onClick={() => vote(c._id, c.position._id)}
                    size="lg"
                  >
                    {voted ? "Voted" : "Vote"}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );
      })}
    </Container>
  );
}
