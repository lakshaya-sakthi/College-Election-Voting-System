// src/components/Navbar.js
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Container, Button } from "react-bootstrap";
import "../styles/glass.css";

export default function Navbar() {
  const { role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`glass-navbar ${scrolled ? "glass-navbar-scrolled" : ""}`}>
      <Container className="d-flex justify-content-between align-items-center py-2">
        <Link
          to="/"
          className="text-white text-decoration-none fw-bold fs-5"
        >
           College Election
        </Link>

        <div className="d-flex gap-2 flex-wrap">
          {!role && (
            <>
              <Button as={Link} to="/login" variant="outline-light" size="sm">
                Login
              </Button>
              <Button as={Link} to="/register" variant="outline-light" size="sm">
                Register
              </Button>
            </>
          )}

          {role === "voter" && (
            <Button as={Link} to="/vote" variant="success" size="sm">
              Vote
            </Button>
          )}

          {role === "admin" && (
            <>
              <Button as={Link} to="/admin" variant="warning" size="sm">
                Dashboard
              </Button>
              <Button as={Link} to="/admin/positions" variant="secondary" size="sm">
                Positions
              </Button>
              <Button as={Link} to="/admin/candidates" variant="primary" size="sm">
                Candidates
              </Button>
            </>
          )}

          {role && (
            <Button as={Link} to="/results" variant="info" size="sm">
              Results
            </Button>
          )}

          {role && (
            <Button variant="danger" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </Container>
    </div>
  );
}
