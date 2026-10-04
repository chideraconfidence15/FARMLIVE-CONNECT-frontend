import { useState } from "react";
import { Button, Input } from "@heroui/react";
import { api } from "../lib/api";

export default function Footer(){
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubscribe = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const result = await api.post("/email/subscribe", { email });
      setFeedback({ type: "success", message: result.message });
      setEmail("");
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to subscribe right now." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 md:mt-[92px] px-6 md:px-[48px] py-10 md:py-[60px] flex flex-col md:flex-row justify-between gap-10 bg-white border-t border-gray-100">
      <div className="md:w-[30%] text-[#757575]">
        <div className="flex items-center gap-3 mb-4">
          <img src="/logo-mark.jpg" className="h-12 w-12 rounded-full bg-[#14532D] object-cover shadow-sm border border-gray-200 scale-110 origin-center" alt="FARMLIVE Connect Logo" />
          <span className="font-extrabold text-xl text-green-900 tracking-tight">FARMLIVE <span className="text-green-600">Connect</span></span>
        </div>
        <div className="text-sm md:text-base leading-relaxed">
          Connecting you directly with the freshest
          produce from local farms. Eat healthy,
          support local farmers, and build a better community.
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1">
        <div>
          <div className="font-bold mb-4 text-gray-800">Quick Links</div>
          <ul className="flex flex-col gap-2 text-[#757575] text-sm md:text-base">
            <li className="hover:text-green-600 cursor-pointer transition-colors">About Us</li> 
            <li className="hover:text-green-600 cursor-pointer transition-colors">Farms</li> 
            <li className="hover:text-green-600 cursor-pointer transition-colors">Delivery Areas</li> 
            <li className="hover:text-green-600 cursor-pointer transition-colors">Sustainability</li> 
          </ul>
        </div>
        <div>
          <div className="font-bold mb-4 text-gray-800">Support</div>
          <ul className="flex flex-col gap-2 text-[#757575] text-sm md:text-base">
            <li className="hover:text-green-600 cursor-pointer transition-colors">Help Center</li> 
            <li className="hover:text-green-600 cursor-pointer transition-colors">Contact Us</li> 
            <li className="hover:text-green-600 cursor-pointer transition-colors">Refund Policy</li> 
            <li className="hover:text-green-600 cursor-pointer transition-colors">Privacy Policy</li> 
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1">
          <div className="font-bold mb-4 text-gray-800">Subscribe</div>
          <p className="text-sm text-[#757575] mb-4">Get updates on seasonal produce and local farm news.</p>
          <form className="flex flex-col gap-3" onSubmit={handleSubscribe}>
            <Input 
              placeholder="Email address" 
              size="sm" 
              type="email" 
              variant="bordered"
              className="w-full"
              value={email}
              onValueChange={setEmail}
              isRequired
              aria-label="Email address for FARMLIVE updates"
            />
            <Button className="w-full bg-[#14532D] font-bold text-yellow-300 hover:bg-[#166534]" shadow type="submit" isLoading={isSubmitting}>
              Subscribe
            </Button>
            {feedback && (
              <p role="status" className={`text-sm ${feedback.type === "success" ? "text-green-700" : "text-red-600"}`}>
                {feedback.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
