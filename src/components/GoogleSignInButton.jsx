import { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client";
let googleScriptPromise;

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => {
      googleScriptPromise = null;
      reject(new Error("Google sign-in could not be loaded."));
    };
    document.head.appendChild(script);
  });
  return googleScriptPromise;
}

export default function GoogleSignInButton({ onCredential, disabled = false, onError }) {
  const buttonRef = useRef(null);
  const handlersRef = useRef({ onCredential, onError });
  const [error, setError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    handlersRef.current = { onCredential, onError };
  }, [onCredential, onError]);

  useEffect(() => {
    if (!clientId || !buttonRef.current || disabled) return undefined;
    let mounted = true;

    loadGoogleIdentityServices()
      .then((google) => {
        if (!mounted || !buttonRef.current) return;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (credential) handlersRef.current.onCredential(credential);
            else handlersRef.current.onError?.(new Error("Google did not return a sign-in credential."));
          }
        });
        google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: Math.min(360, Math.floor(buttonRef.current.getBoundingClientRect().width || 320))
        });
      })
      .catch((loadError) => {
        if (!mounted) return;
        setError(loadError.message);
        handlersRef.current.onError?.(loadError);
      });

    return () => {
      mounted = false;
    };
  }, [clientId, disabled]);

  if (!clientId) {
    return <p className="text-sm text-center text-red-600">Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID.</p>;
  }

  return (
    <div className="w-full flex flex-col items-center gap-2" aria-busy={disabled}>
      <div ref={buttonRef} className={`w-full flex justify-center ${disabled ? "pointer-events-none opacity-60" : ""}`} />
      {error && <p role="status" className="text-sm text-red-600">{error}</p>}
      {disabled && <span className="sr-only">Signing in with Google</span>}
    </div>
  );
}
