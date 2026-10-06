import { Alert, Button, Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/userContext";

export default function VerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifySignupOtp, resendSignupOtp } = useUser();
  const [email] = useState(() => {
    return location.state?.email || localStorage.getItem("farmlive_pending_signup_email") || "";
  });
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = window.setTimeout(() => setCountdown((remaining) => remaining - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  async function handleVerify(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsVerifying(true);
    try {
      await verifySignupOtp(email, code);
      navigate("/", { replace: true });
    } catch (verifyError) {
      setError(verifyError.message);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");
    setIsResending(true);
    try {
      const result = await resendSignupOtp(email);
      setMessage(result.message);
      setCountdown(60);
    } catch (resendError) {
      setError(resendError.message);
    } finally {
      setIsResending(false);
    }
  }

  if (!email) {
    return (
      <div className="bg-[#FAFAFA] p-6 w-full md:w-[70%] lg:w-[65%] rounded-[20px] flex flex-col gap-4 border border-gray-100">
        <h1 className="font-bold text-2xl text-center">Signup verification</h1>
        <p className="text-center text-gray-600">Start signup to receive a verification code.</p>
        <Link className="text-center text-green-700 font-semibold" to="/auth/signup">Return to signup</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] p-6 w-full md:w-[70%] lg:w-[65%] rounded-[20px] flex flex-col gap-4 border border-gray-100">
      <h1 className="font-bold text-2xl text-center">Check your email</h1>
      <p className="text-center text-gray-600">Enter the six-digit code sent to <strong>{email}</strong>. The code expires in 10 minutes.</p>
      {error && <Alert color="danger" title={error} />}
      {message && <Alert color="success" title={message} />}
      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <Input
          label="Verification code"
          placeholder="000000"
          value={code}
          onValueChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          isRequired
        />
        <Button className="!bg-[#14532D] !font-bold !text-[#EAB308] hover:!bg-[#166534]" type="submit" isLoading={isVerifying} isDisabled={code.length !== 6}>
          Verify and continue
        </Button>
      </form>
      <Button variant="flat" onPress={handleResend} isLoading={isResending} isDisabled={countdown > 0 || isVerifying}>
        {countdown > 0 ? `Send a new code in ${countdown}s` : "Resend verification code"}
      </Button>
      <Link className="text-center text-green-700 font-semibold" to="/auth/login">Back to login</Link>
    </div>
  );
}