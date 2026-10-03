import { Outlet, useNavigation, Navigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ScrollToTop from "../../components/ScrollToTop";
import { Progress, Spinner } from "@heroui/react";
import { useUser } from "../../contexts/userContext";

export default function DefaultLayout() {
  const { user, loading } = useUser();
  const location = useLocation();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  // While checking session state
  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F2F6F2] gap-3">
        <Spinner size="lg" color="success" />
        <p className="text-green-800 font-semibold text-lg">Connecting to FARMLIVE...</p>
      </div>
    );
  }

  // Gatekeeping Requirement:
  // "nobody should be able to access the homepage without creating an account first and signing in"
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <div className='w-full bg-[#F2F6F2] relative'>
        <ScrollToTop />
        {isLoading && (
          <Progress
            size="sm"
            isIndeterminate
            aria-label="Loading..."
            className="fixed top-0 left-0 right-0 z-[100]"
            color="success"
          />
        )}
        <Navbar />
        <div className="m-4 min-h-screen">
          <Outlet />
        </div>
        <Footer />
    </div>
  );
}
