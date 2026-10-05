import { Outlet } from "react-router-dom";
import AppNavbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function TwoColumns({children}) {
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen">
      <div className="relative hidden md:flex md:w-1/2 items-center justify-center overflow-hidden bg-[url('/auth-cattle.jpg')] bg-cover bg-center px-10 text-center text-white">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-xl">
          <p className="text-4xl font-extrabold md:text-5xl">FARMLIVE <span className="text-lime-300">Connect</span></p>
          <h1 className="mt-10 text-3xl font-bold md:text-4xl">From thriving farms to your table</h1>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-white/90">
            Discover livestock raised with care and fresh produce from trusted farms.
          </p>
        </div>
      </div>
      <div className="md:hidden">
        <AppNavbar />
      </div>
      <div className="bg-[#F2F6F2] w-full  min-w-[400px] md:w-[50vw] grid place-items-center overflow-scroll">
      <Outlet />
      <div className="md:hidden">
        <Footer />
      </div>
      </div>
    </div>
  );
}
