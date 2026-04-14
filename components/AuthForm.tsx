"use client";
import { useEffect } from 'react';
import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        window.location.href = '/dashboard';
      }
    };

    checkUser();
  }, []);

  // 🔐 Google Login
const loginWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
};

  // 📧 Send OTP
  const sendOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setStep("otp");
      setMessage("OTP sent to your email");
    }

    setLoading(false);
  };

  // 🔢 Verify OTP
  const verifyOtp = async () => {
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Login successful 🚀");
      window.location.href = "/dashboard";
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-900 to-black">
      <Card className="w-full max-w-md p-6 bg-black/40 backdrop-blur border border-green-700">
        <CardContent className="space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">
            Welcome 🚀
          </h2>

          {/* Google Button */}
          <Button
            onClick={loginWithGoogle}
            className="w-full bg-white text-black hover:bg-gray-200"
          >
            Continue with Google
          </Button>

          <div className="text-center text-gray-400">or</div>

          {/* Email Step */}
          {step === "email" && (
            <>
              <Input
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/30 border-green-700 text-white"
              />
              <Button
                onClick={sendOtp}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                Send OTP
              </Button>
            </>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <>
              <Input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="bg-black/30 border-green-700 text-white"
              />
              <Button
                onClick={verifyOtp}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                Verify OTP
              </Button>
            </>
          )}

          {message && (
            <p className="text-sm text-center text-gray-300">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
