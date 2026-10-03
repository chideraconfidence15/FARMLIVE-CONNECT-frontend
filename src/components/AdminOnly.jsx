import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/userContext";

export default function AdminOnly({ children }) {
  const { user } = useUser();
  return user?.role === "admin" ? children : <Navigate to="/" replace />;
}