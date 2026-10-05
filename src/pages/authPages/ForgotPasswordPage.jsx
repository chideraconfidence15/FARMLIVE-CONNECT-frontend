import { Alert, Button, Input } from "@heroui/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("request");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function requestCode(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const result = await api.post("/auth/password-reset/request", { email });
      setMessage(result.message);
      setStep("reset");
    } catch (requestError) {
      setError(requestError.message || "Unable to request a reset code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.post("/auth/password-reset/confirm", { email, code, password });
      setMessage(result.message);
      setStep("complete");
    } catch (resetError) {
      setError(resetError.message || "Unable to reset your password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-5 rounded-[20px] border border-gray-100 bg-[#FAFAFA] p-6 shadow-sm md:w-[70%] lg:w-[65%]">
      <div className="flex justify-center">
        <img src="/logo-mark.jpg" alt="FARMLIVE Connect Logo" className="h-16 w-16 rounded-full border border-gray-200 bg-[#14532D] object-cover" />
      </div>
      <div className="-mt-2 text-center text-xl font-extrabold text-green-800">FARMLIVE <span className="text-green-600">Connect</span></div>
      <h1 className="text-center text-3xl font-bold">Reset password</h1>
      {error && <Alert color="danger" title={error} />}
      {message && <Alert color="success" title={message} />}

      {step === "request" && (
        <form onSubmit={requestCode} className="flex flex-col gap-4">
          <p className="text-center text-sm text-gray-600">Enter your account email and we will send a reset code if an account matches.</p>
          <Input label="Email" type="email" value={email} onValueChange={setEmail} isRequired />
          <Button type="submit" isLoading={isSubmitting} className="!bg-[#14532D] !font-bold !text-[#EAB308] hover:!bg-[#166534]">Send reset code</Button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={resetPassword} className="flex flex-col gap-4">
          <Input label="Email" type="email" value={email} onValueChange={setEmail} isRequired />
          <Input label="Six-digit reset code" inputMode="numeric" maxLength={6} value={code} onValueChange={setCode} isRequired />
          <Input label="New password" type="password" value={password} onValueChange={setPassword} minLength={6} isRequired />
          <Input label="Confirm new password" type="password" value={confirmPassword} onValueChange={setConfirmPassword} minLength={6} isRequired />
          <Button type="submit" isLoading={isSubmitting} className="!bg-[#14532D] !font-bold !text-[#EAB308] hover:!bg-[#166534]">Reset password</Button>
        </form>
      )}

      {step === "complete" && <Link className="text-center font-semibold text-green-700" to="/auth/login">Go to login</Link>}
      {step !== "complete" && <Link className="text-center text-sm font-semibold text-green-700" to="/auth/login">Back to login</Link>}
    </div>
  );
}
