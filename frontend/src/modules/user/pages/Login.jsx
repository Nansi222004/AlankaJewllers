import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import loginHero from "@assets/login_hero_silver.png";
import defaultLogo from "@/assets/Alankar jewllers.png";
import { useAuth } from "../../../context/AuthContext";
import { useShop } from "../../../context/ShopContext";
import { useSettings } from "../../../context/SettingsContext";
import { readMenPendingCartItem, clearMenPendingCartItem } from "../utils/menNavigation";
import { readWomenPendingCartItem, clearWomenPendingCartItem } from "../utils/womenNavigation";

const emptyOtp = () => Array(6).fill("");

const Login = () => {
  const {
    startLogin,
    startRegistration,
    verifyEmailOtp,
    resendEmailOtp,
    requestPasswordReset,
    verifyPasswordResetOtp,
    resetPassword,
  } = useAuth();
  const { addToCart } = useShop();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const otpRefs = useRef([]);
  const isSignup = location.pathname === "/signup";
  const redirectParam = new URLSearchParams(location.search).get("redirect");
  const redirectTarget = redirectParam?.startsWith("/") ? redirectParam : "/profile";

  const [step, setStep] = useState("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(emptyOtp);
  const [challengeId, setChallengeId] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentLogo = settings?.logo && !settings.logo.includes("logo.webp") && !/swarna|sands/i.test(settings.logo)
    ? settings.logo
    : defaultLogo;
  const currentStoreName = !settings?.storeName || /swarna\s*sparsh/i.test(settings.storeName)
    ? "Alankar Jewellers"
    : settings.storeName;

  useEffect(() => {
    setStep("credentials");
    setPassword("");
    setOtp(emptyOtp());
    setChallengeId("");
    setError("");
  }, [isSignup]);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = window.setInterval(() => setResendSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (step === "otp" || step === "resetOtp") {
      window.setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const finishLogin = () => {
    const pendingWomenCartItem = readWomenPendingCartItem();
    if (pendingWomenCartItem) {
      addToCart(pendingWomenCartItem);
      clearWomenPendingCartItem();
      navigate("/cart", { replace: true });
      return;
    }
    const pendingMenCartItem = readMenPendingCartItem();
    if (pendingMenCartItem) {
      addToCart(pendingMenCartItem);
      clearMenPendingCartItem();
      navigate("/cart", { replace: true });
      return;
    }
    navigate(redirectTarget, { replace: true });
  };

  const run = async (action) => {
    if (submitting) return null;
    setSubmitting(true);
    setError("");
    try {
      const result = await action();
      if (!result?.success) setError(result?.message || "Something went wrong. Please try again.");
      return result;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCredentials = async (event) => {
    event.preventDefault();
    const result = await run(() => isSignup
      ? startRegistration({ name: fullName.trim(), phone, email: email.trim(), password })
      : startLogin(email.trim(), password));
    if (result?.success) {
      if (!isSignup) {
        finishLogin();
        return;
      }
      setChallengeId(result.data.challengeId);
      setOtp(emptyOtp());
      setResendSeconds(result.data.resendAfter || 60);
      setStep("otp");
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the verification code.");
      return;
    }
    const result = await run(() => verifyEmailOtp(challengeId, code));
    if (result?.success) finishLogin();
  };

  const handleForgot = async (event) => {
    event.preventDefault();
    const result = await run(() => requestPasswordReset(email.trim()));
    if (result?.success) {
      setChallengeId(result.data.challengeId);
      setOtp(emptyOtp());
      setResendSeconds(result.data.resendAfter || 60);
      setStep("resetOtp");
      toast.success(result.message);
    }
  };

  const handleResetOtp = async (event) => {
    event.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the verification code.");
      return;
    }
    const result = await run(() => verifyPasswordResetOtp(challengeId, code));
    if (result?.success) {
      setResetToken(result.data.resetToken);
      setStep("newPassword");
    }
  };

  const handleNewPassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const result = await run(() => resetPassword(challengeId, resetToken, newPassword));
    if (result?.success) {
      toast.success(result.message);
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("credentials");
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || submitting) return;
    const result = await run(() => resendEmailOtp(challengeId));
    if (result?.success) {
      setOtp(emptyOtp());
      setResendSeconds(result.data.resendAfter || 60);
      toast.success(result.message);
      otpRefs.current[0]?.focus();
    }
  };

  const updateOtp = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (event) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;
    event.preventDefault();
    setOtp(Array.from({ length: 6 }, (_, index) => digits[index] || ""));
    otpRefs.current[Math.min(digits.length, 6) - 1]?.focus();
  };

  const title = step === "otp"
    ? "Verify Your Email"
    : step === "forgot"
      ? "Forgot Password"
      : step === "resetOtp"
        ? "Verify Your Email"
        : step === "newPassword"
          ? "Set New Password"
          : isSignup ? "Create Account" : "Welcome Back";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-brand-pearl p-4 text-brand-espresso">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 scale-[1.25] bg-cover bg-left-bottom grayscale-[20%]" style={{ backgroundImage: `url(${loginHero})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/75 to-brand-espresso/25 backdrop-blur-[2px]" />
      </div>

      <button onClick={() => navigate("/")} className="absolute left-4 top-4 z-[60] rounded-full p-3 text-brand-espresso transition hover:bg-white/60" aria-label="Back to home">
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="relative z-50 my-auto w-full max-w-sm rounded-[2rem] border border-brand-border bg-white/95 px-5 py-7 shadow-[0_16px_50px_rgba(51,40,39,0.15)] backdrop-blur-xl sm:px-7">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={currentLogo} alt={currentStoreName} className="h-16 w-16 object-contain" onError={(event) => { event.currentTarget.src = defaultLogo; }} />
          <span className="font-serif text-lg font-bold uppercase tracking-wider">{currentStoreName}</span>
        </div>

        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-bold text-brand-espresso">{title}</h1>
          <p className="mt-1 text-sm text-brand-taupe">
            {step === "otp" || step === "resetOtp"
              ? <>We&apos;ve sent a verification code to<br /><span className="font-medium text-brand-espresso">{email}</span></>
              : step === "forgot"
                ? "Enter your account email to receive a verification code."
                : step === "newPassword"
                  ? "Choose a secure password for your account."
                  : isSignup ? "Begin your journey with us." : "Sign in securely with your email."}
          </p>
        </div>

        {error && <div role="alert" className="mb-4 rounded-xl border border-brand-blush bg-brand-rosewater/45 px-3 py-2.5 text-sm text-brand-plum">{error}</div>}

        {step === "credentials" && (
          <form onSubmit={handleCredentials} className="space-y-4">
            {isSignup && (
              <>
                <Field label="Full Name" type="text" value={fullName} onChange={setFullName} placeholder="Enter your name" autoComplete="name" />
                <Field label="Mobile Number" type="tel" value={phone} onChange={(value) => setPhone(value.replace(/\D/g, "").slice(0, 10))} placeholder="98765 43210" autoComplete="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" />
              </>
            )}
            <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
            <PasswordField label="Password" value={password} onChange={setPassword} show={showPassword} setShow={setShowPassword} autoComplete={isSignup ? "new-password" : "current-password"} />
            {!isSignup && (
              <button type="button" onClick={() => { setStep("forgot"); setError(""); }} className="block w-full text-right text-xs font-semibold text-brand-plum hover:text-brand-champagne">Forgot Password?</button>
            )}
            <PrimaryButton loading={submitting}>{isSignup ? "Create Account" : "Login"}</PrimaryButton>
          </form>
        )}

        {(step === "otp" || step === "resetOtp") && (
          <form onSubmit={step === "otp" ? handleVerify : handleResetOtp} className="space-y-5">
            <div className="grid grid-cols-6 gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input key={index} ref={(element) => { otpRefs.current[index] = element; }} type="text" inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} value={digit} maxLength="1" onChange={(event) => updateOtp(index, event.target.value)} onKeyDown={(event) => handleOtpKeyDown(event, index)} aria-label={`Verification digit ${index + 1}`} className="h-12 min-w-0 rounded-lg border border-brand-border bg-brand-pearl text-center text-xl font-bold outline-none transition focus:border-brand-champagne focus:ring-1 focus:ring-brand-champagne" />
              ))}
            </div>
            <PrimaryButton loading={submitting}>{step === "otp" ? "Verify Email" : "Verify Code"}</PrimaryButton>
            <div className="flex items-center justify-between gap-3 text-xs">
              <button type="button" onClick={handleResend} disabled={resendSeconds > 0 || submitting} className="font-semibold text-brand-plum disabled:text-brand-taupe">
                {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend code"}
              </button>
              <button type="button" onClick={() => { setStep(step === "otp" ? "credentials" : "forgot"); setOtp(emptyOtp()); setError(""); }} className="font-semibold text-brand-taupe hover:text-brand-plum">Change email / Back</button>
            </div>
          </form>
        )}

        {step === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-4">
            <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
            <PrimaryButton loading={submitting}>Send Verification Code</PrimaryButton>
            <button type="button" onClick={() => { setStep("credentials"); setError(""); }} className="w-full text-xs font-semibold text-brand-taupe hover:text-brand-plum">Back to login</button>
          </form>
        )}

        {step === "newPassword" && (
          <form onSubmit={handleNewPassword} className="space-y-4">
            <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} show={showPassword} setShow={setShowPassword} autoComplete="new-password" />
            <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} show={showPassword} setShow={setShowPassword} autoComplete="new-password" />
            <PrimaryButton loading={submitting}>Update Password</PrimaryButton>
          </form>
        )}

        {step === "credentials" && (
          <p className="mt-7 text-center text-xs text-brand-taupe">
            {isSignup ? "Already a member?" : "New here?"}
            <Link to={isSignup ? "/login" : "/signup"} className="ml-1 font-bold text-brand-espresso underline decoration-brand-champagne underline-offset-4">
              {isSignup ? "Login" : "Join Now"}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, ...props }) => (
  <label className="block space-y-1.5">
    <span className="pl-1 text-[10px] font-bold uppercase tracking-wider text-brand-taupe">{label}</span>
    <input required value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-xl border border-brand-border bg-brand-pearl/70 px-4 text-brand-espresso outline-none transition placeholder:text-brand-taupe/70 focus:border-brand-champagne focus:ring-1 focus:ring-brand-champagne" {...props} />
  </label>
);

const PasswordField = ({ label, value, onChange, show, setShow, autoComplete }) => (
  <label className="block space-y-1.5">
    <span className="pl-1 text-[10px] font-bold uppercase tracking-wider text-brand-taupe">{label}</span>
    <span className="relative block">
      <input required minLength="8" maxLength="72" type={show ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} placeholder="••••••••" className="h-12 w-full rounded-xl border border-brand-border bg-brand-pearl/70 px-4 pr-12 text-brand-espresso outline-none transition focus:border-brand-champagne focus:ring-1 focus:ring-brand-champagne" />
      <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-brand-taupe" aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </span>
  </label>
);

const PrimaryButton = ({ children, loading }) => (
  <button type="submit" disabled={loading} className="w-full rounded-xl border border-brand-plum bg-brand-plum py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:border-brand-champagne hover:bg-brand-champagne hover:text-brand-espresso disabled:cursor-not-allowed disabled:opacity-60">
    {loading ? "Please wait…" : children}
  </button>
);

export default Login;
