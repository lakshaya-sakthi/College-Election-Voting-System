import API from "../api";
import { toast } from "react-toastify";
import { Container, Card, Button, Row, Col } from "react-bootstrap";

export default function AdminDashboard() {
  // Start election
  const startElection = async () => {
    try {
      await API.post("/admin/start");
      toast.success("Election started");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to start election");
    }
  };

  // Stop election
  const stopElection = async () => {
    try {
      await API.post("/admin/stop");
      toast.success("Election stopped");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to stop election");
    }
  };

  // Reset election
  const resetElection = async () => {
    try {
      await API.post("/admin/reset");
      toast.success("Election reset completed");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to reset election");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg border-0 glass-card">
            <Card.Body className="text-center">
              <Card.Title className="mb-3 fs-3 fw-bold">
                Admin Dashboard
              </Card.Title>

              <Card.Text className="text-muted mb-4">
                Control the election lifecycle securely
              </Card.Text>

              <div className="d-grid gap-3">
                <Button
                  variant="success"
                  size="lg"
                  onClick={startElection}
                >
                  Start Election
                </Button>

                <Button
                  variant="danger"
                  size="lg"
                  onClick={stopElection}
                >
                  Stop Election
                </Button>

                <Button
                  variant="warning"
                  size="lg"
                  onClick={resetElection}
                >
                  Reset Election
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
