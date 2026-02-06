import { motion } from "framer-motion";
import "../styles/glass.css";

export default function PageWrapper({ children }) {
  return (
    <motion.div
      className="app-bg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <div className="glass-container">
          {children}
        </div>
      </div>
    </motion.div>
  );
}