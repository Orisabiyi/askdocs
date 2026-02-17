"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Loader2, ArrowRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [timezone, setTimezone] = useState("");
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(true);

  // Auto-detect location on mount
  useEffect(() => {
    async function detectLocation() {
      try {
        const res = await fetch("/api/user/location");
        const data = await res.json();

        if (data.country) setCountry(data.country);
        if (data.state) setState(data.state);
        if (data.timezone) setTimezone(data.timezone);
      } catch {
        // Silent fail — user can enter manually
      } finally {
        setDetecting(false);
      }
    }

    detectLocation();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, state, timezone }),
      });

      if (res.ok) {
        router.push("/chat");
      }
    } catch {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/chat");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-white dark:bg-zinc-950">
      <motion.div
        className="w-full max-w-sm space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        {/* Header */}
        <div className="space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 mb-4">
            <MapPin className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Where are you based?
          </h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            This helps AskDocs give you relevant local context — like
            applicable laws, regulations, and standards — when answering
            questions about your documents.
          </p>
        </div>

        {detecting ? (
          <div className="flex items-center gap-2 text-[13px] text-zinc-400 dark:text-zinc-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Detecting your location...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="country"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Country
              </label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Nigeria"
                required
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="state"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                State / Region{" "}
                <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                  (optional)
                </span>
              </label>
              <input
                id="state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Lagos"
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
              />
            </div>

            {timezone && (
              <p className="text-[13px] text-zinc-400 dark:text-zinc-500">
                Timezone detected:{" "}
                <span className="text-zinc-600 dark:text-zinc-300">
                  {timezone}
                </span>
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !country}
                className="group flex-1 flex items-center justify-center gap-2 rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="rounded-md border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                Skip
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}