import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import {
  Container,
  Card,
  Badge,
  Row,
  Col,
  Alert
} from "react-bootstrap";

export default function Results() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await API.get("/results");
        setResults(res.data);
      } catch (err) {
        toast.error(err.response?.data?.msg || "Results not available");
      }
    };
    fetchResults();
  }, []);

  return (
    <Container>
      <h2 className="text-center fw-bold mb-4">
         Election Results
      </h2>

      {results.length === 0 && (
        <Alert variant="warning" className="text-center">
          Results not published yet
        </Alert>
      )}

      {results.map((r, index) => (
        <Card key={index} className="glass-card mb-4">
          <Card.Body>
            <Row className="align-items-center">
              {/* Position */}
              <Col md={6}>
                <Card.Title className="mb-2">
                  {r.position}
                </Card.Title>
                <Badge bg="info" className="glass-badge">
                  Position
                </Badge>
              </Col>

              {/* Winner */}
              <Col md={6} className="text-md-end mt-3 mt-md-0">
                {r.winner ? (
                  <>
                    <Card.Text className="mb-2 text-dark">
                      Winner:
                      <span className="ms-2 fw-bold text-dark">
                        {r.winner.name}
                      </span>
                    </Card.Text>
                    <Badge bg="success" className="glass-badge">
                      Votes: {r.winner.votes}
                    </Badge>
                  </>
                ) : (
                  <Badge bg="secondary" className="glass-badge">
                    No winner
                  </Badge>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}
