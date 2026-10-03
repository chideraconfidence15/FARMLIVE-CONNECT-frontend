import { Alert, Button, Checkbox, Input } from "@heroui/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/userContext";
import GoogleSignInButton from "../../components/GoogleSignInButton";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: true
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signup, loginWithGoogle } = useUser();
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function handleSignup(event) {
    event.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.agreeToTerms) {
      setError("You must agree to the terms of service.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(formData);
      navigate("/auth/verify", { state: { email: formData.email } });
    } catch (signupError) {
      setError(signupError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleCredential(credential) {
    setError("");
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(credential);
      navigate("/");
    } catch (googleError) {
      setError(googleError.message);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="bg-[#FAFAFA] p-[24px] w-full md:w-[70%] lg:w-[65%] rounded-[20px] flex flex-col gap-[16px] shadow-sm border border-gray-100">
      <div className="flex justify-center items-center gap-3 mb-1">
        <img src="/logo-mark.jpg" alt="FARMLIVE Connect Logo" className="h-16 w-16 rounded-full bg-[#14532D] object-cover shadow-sm border border-gray-200 scale-110 origin-center" />
      </div>
      <div className="text-center font-extrabold text-xl text-green-800 -mt-2">FARMLIVE <span className="text-green-600">Connect</span></div>
      <h1 className="font-bold text-[36px] text-center">Join FARMLIVE Connect</h1>
      {error && <Alert color="danger" title={error} />}
      <form onSubmit={handleSignup} className="flex flex-col gap-[16px]">
        <div className="flex flex-col md:flex-row gap-3">
          <Input name="firstname" label="First name" value={formData.firstname} onChange={handleChange} placeholder="Enter your first name" isRequired />
          <Input name="lastname" label="Last name" value={formData.lastname} onChange={handleChange} placeholder="Enter your last name" isRequired />
        </div>
        <Input name="email" label="Email" value={formData.email} onChange={handleChange} placeholder="Enter your email" type="email" isRequired />
        <Input
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          type={isPasswordVisible ? "text" : "password"}
          isRequired
          endContent={(
            <button type="button" onClick={() => setIsPasswordVisible((visible) => !visible)} aria-label={isPasswordVisible ? "Hide password" : "Show password"}>
              {isPasswordVisible ? "Hide" : "Show"}
            </button>
          )}
        />
        <Input name="confirmPassword" label="Confirm password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" type="password" isRequired />
        <Checkbox isSelected={formData.agreeToTerms} onValueChange={(checked) => setFormData((current) => ({ ...current, agreeToTerms: checked }))}>
          I agree to the <a className="text-green-600">Terms of Service</a> and <a className="text-green-600" href="#">Privacy Policy</a>
        </Checkbox>
        <Button isLoading={isSubmitting} type="submit" className="text-white w-full" color="success">Sign Up</Button>
        <div className="border-t border-gray-300 my-2"></div>
        <GoogleSignInButton onCredential={handleGoogleCredential} disabled={isGoogleLoading} onError={(googleError) => setError(googleError.message)} />
        <p className="text-center">Already have an account? <Link className="text-green-600" to="/auth/login">Login</Link></p>
      </form>
    </div>
  );
}