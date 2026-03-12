import { Link, useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  const handleLogout = () => {


    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");

    navigate("/");

  };

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Eco AI Tools</h2>

      <div style={styles.links}>
        <Link to="/auto-category" style={styles.link}>
          Auto Category Generator
        </Link>

        <Link to="/b2b-proposal" style={styles.link}>
          B2B Proposal Generator
        </Link>

        <Link to="/support-bot" style={styles.link}>
          WhatsApp Support Bot
        </Link>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    background: "#0f172a",
    color: "white"
  },

  logo: {
    margin: 0
  },

  links: {
    display: "flex",
    gap: "25px",
    alignItems: "center"
  },

  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "500"
  },

  logoutButton: {
    padding: "6px 12px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default Navbar;