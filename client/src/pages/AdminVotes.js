import { useEffect, useMemo, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import {
  Container,
  Card,
  Table,
  Alert,
  Row,
  Col,
  Form,
  Pagination
} from "react-bootstrap";

export default function AdminVotes() {
  const [votes, setVotes] = useState([]);

  // Filters
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [search, setSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // admin can change

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const res = await API.get("/admin/votes");
        setVotes(res.data);
      } catch (err) {
        toast.error(err.response?.data?.msg || "Failed to fetch votes");
      }
    };
    fetchVotes();
  }, []);

  // Build unique positions list
  const positions = useMemo(() => {
    const map = new Map();
    votes.forEach((v) => {
      const id = v.position?._id;
      const name = v.position?.name;
      if (id && name) map.set(id, name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [votes]);

  // Filter votes
  const filteredVotes = useMemo(() => {
    const s = search.trim().toLowerCase();

    return votes.filter((v) => {
      const posId = v.position?._id;

      const matchesPosition =
        selectedPosition === "all" || posId === selectedPosition;

      const voterName = (v.voter?.name || "").toLowerCase();
      const voterEmail = (v.voter?.email || "").toLowerCase();
      const candidateName = (v.candidate?.name || "").toLowerCase();
      const positionName = (v.position?.name || "").toLowerCase();

      const matchesSearch =
        !s ||
        voterName.includes(s) ||
        voterEmail.includes(s) ||
        candidateName.includes(s) ||
        positionName.includes(s);

      return matchesPosition && matchesSearch;
    });
  }, [votes, selectedPosition, search]);

  // ✅ Reset to page 1 when filters/search/pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPosition, search, pageSize]);

  // Pagination calculations
  const totalItems = filteredVotes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedVotes = filteredVotes.slice(startIndex, endIndex);

  // Build pagination items (nice UX)
  const paginationItems = useMemo(() => {
    const items = [];
    const maxToShow = 5;

    let start = Math.max(1, currentPage - Math.floor(maxToShow / 2));
    let end = Math.min(totalPages, start + maxToShow - 1);

    // adjust start if we're near end
    start = Math.max(1, end - maxToShow + 1);

    for (let i = start; i <= end; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    return items;
  }, [currentPage, totalPages]);

  return (
    <Container className="mt-4">
      <Card className="glass-card p-3 shadow-sm">
        <h3 className="text-center mb-3 fw-bold">Vote List (Admin)</h3>

        {/* Filters + Page Size */}
        <Row className="g-2 mb-3 align-items-center">
          <Col md={3}>
            <Form.Select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
            >
              <option value="all">All Positions</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={6}>
            <Form.Control
              placeholder="Search voter / email / candidate / position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
        </Row>

        {/* Showing info */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="text-muted">
            Showing <b>{totalItems === 0 ? 0 : startIndex + 1}</b>–<b>{endIndex}</b> of{" "}
            <b>{totalItems}</b>
          </div>
          <div className="text-muted">
            Page <b>{currentPage}</b> / <b>{totalPages}</b>
          </div>
        </div>

        {totalItems === 0 ? (
          <Alert variant="warning" className="text-center">
            No votes match the filter
          </Alert>
        ) : (
          <>
            <Table striped bordered hover responsive className="mb-3">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Voter Name</th>
                  <th>Email</th>
                  <th>Position</th>
                  <th>Candidate</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVotes.map((v, index) => (
                  <tr key={v._id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{v.voter?.name || "-"}</td>
                    <td>{v.voter?.email || "-"}</td>
                    <td>{v.position?.name || "-"}</td>
                    <td>{v.candidate?.name || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">

  {/* Items Per Page Dropdown */}
  <Form.Select
    size="sm"
    style={{ width: "65px" }}
    value={pageSize}
    onChange={(e) => setPageSize(Number(e.target.value))}
  >
    <option value={5}>5</option>
    <option value={10}>10</option>
    <option value={20}>20</option>
    <option value={50}>50</option>
  </Form.Select>

  {/* Pagination Controls */}
  <Pagination className="mb-0">
    <Pagination.Prev
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
    />

    {paginationItems}

    <Pagination.Next
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
    />
  </Pagination>

</div>

          </>
        )}
      </Card>
    </Container>
  );
}
