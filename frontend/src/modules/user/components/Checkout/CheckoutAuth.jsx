import React from "react";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

const CheckoutAuth = () => (
  <div className="container mx-auto flex min-h-[70vh] items-center justify-center bg-brand-white px-4 py-12 md:py-24">
    <div className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-white p-7 text-center shadow-xl shadow-brand-espresso/5 md:p-9">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-brand-border bg-brand-pearl">
        <Lock className="h-6 w-6 text-brand-espresso" strokeWidth={1.5} />
      </div>
      <h2 className="mb-2 font-serif text-2xl font-bold text-brand-espresso md:text-3xl">Login to Checkout</h2>
      <p className="mb-7 text-sm leading-6 text-brand-taupe">Sign in securely with your email, password, and email verification code to continue.</p>
      <Link to="/login?redirect=/checkout" className="block w-full rounded-xl border border-brand-plum bg-brand-plum py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:border-brand-champagne hover:bg-brand-champagne hover:text-brand-espresso">
        Continue to Login
      </Link>
    </div>
  </div>
);

export default CheckoutAuth;
