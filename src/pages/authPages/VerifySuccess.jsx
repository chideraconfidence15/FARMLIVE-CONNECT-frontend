import { Button } from "@heroui/react"
import { Link } from "react-router-dom"
import { useUser } from "../../contexts/userContext";
import { useEffect } from "react";

export default function VerifySuccess() {
  const { verifyEmail } = useUser();

  useEffect(() => {
    verifyEmail();
  }, [])

  return (
    <div className="w-full flex flex-col gap-6 items-center text-center">
      <div className="p-4 bg-green-50 rounded-full mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#4CAF50" className="size-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <div>
        <h1 className="font-bold text-[28px] md:text-[32px] text-gray-800 leading-tight">Verification Successful!</h1>
        <p className="text-gray-500 mt-4 leading-relaxed">Your account has been verified successfully. You can now access all features of FARMLIVE Connect.</p>
      </div>
      <div className="w-full mt-4">
        <Link className="w-full" to="/auth/login">
          <Button className="w-full bg-[#4CAF50] text-white font-bold h-12" color="success" shadow>Proceed to Login</Button>
        </Link>
      </div>
    </div>
  )
}
