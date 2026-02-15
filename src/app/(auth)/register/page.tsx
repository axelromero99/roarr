"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SPECIES_OPTIONS = [
  "Wolf", "Fox", "Cat", "Dog", "Dragon", "Deer", "Bear", "Rabbit",
  "Bird", "Shark", "Otter", "Raccoon", "Lion", "Tiger", "Horse",
  "Bat", "Snake", "Lizard", "Hybrid", "Other",
];

const INTEREST_OPTIONS = [
  "Art", "Music", "Gaming", "Cosplay", "Writing", "Fursuiting",
  "Photography", "Hiking", "Anime", "Movies", "Cooking", "Dancing",
  "Technology", "Nature", "Conventions", "Crafting",
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    fursonaName: "",
    species: "",
    fursonaType: "furry" as "furry" | "therian" | "otherkin",
    fursonaDescription: "",
    age: "",
    gender: "",
    lookingFor: [] as string[],
    interests: [] as string[],
    location: "",
    bio: "",
  });

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleLookingFor = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(value)
        ? prev.lookingFor.filter((v) => v !== value)
        : [...prev.lookingFor, value],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          fursona: {
            name: formData.fursonaName,
            species: formData.species,
            fursonaType: formData.fursonaType,
            description: formData.fursonaDescription,
          },
          age: parseInt(formData.age),
          gender: formData.gender,
          lookingFor: formData.lookingFor,
          interests: formData.interests,
          location: formData.location,
          bio: formData.bio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign in
      await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      router.push("/swipe");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return (
          formData.email &&
          formData.password &&
          formData.password === formData.confirmPassword &&
          formData.password.length >= 6
        );
      case 2:
        return (
          formData.displayName &&
          formData.fursonaName &&
          formData.species &&
          formData.fursonaType
        );
      case 3:
        return formData.age && parseInt(formData.age) >= 18 && formData.gender;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-6">
          <h1 className="text-4xl font-black text-neon-purple animate-pulse-neon">
            Roarr
          </h1>
        </Link>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                s <= step ? "gradient-bg" : "bg-border"
              }`}
            />
          ))}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 card-shadow">
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold gradient-text">
                Create Account
              </h2>
              <div>
                <label className="block text-sm text-foreground/60 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground/60 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground/60 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    updateField("confirmPassword", e.target.value)
                  }
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
                  placeholder="Repeat password"
                />
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-danger text-xs mt-1">
                      Passwords don&apos;t match
                    </p>
                  )}
              </div>
            </div>
          )}

          {/* Step 2: Fursona */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold gradient-text">Your Fursona</h2>
              <div>
                <label className="block text-sm text-foreground/60 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => updateField("displayName", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
                  placeholder="How others will see you"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground/60 mb-1">
                  Fursona Name
                </label>
                <input
                  type="text"
                  value={formData.fursonaName}
                  onChange={(e) => updateField("fursonaName", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
                  placeholder="Your fursona's name"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground/60 mb-1">
                  Type
                </label>
                <div className="flex gap-2">
                  {(["furry", "therian", "otherkin"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField("fursonaType", type)}
                      className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${
                        formData.fursonaType === type
                          ? "border-neon-purple bg-neon-purple/20 text-neon-purple"
                          : "border-border text-foreground/60 hover:border-neon-purple/50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground/60 mb-1">
                  Species
                </label>
                <select
                  value={formData.species}
                  onChange={(e) => updateField("species", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
                >
                  <option value="">Select species</option>
                  {SPECIES_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-foreground/60 mb-1">
                  Fursona Description
                </label>
                <textarea
                  value={formData.fursonaDescription}
                  onChange={(e) =>
                    updateField("fursonaDescription", e.target.value)
                  }
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors resize-none"
                  placeholder="Describe your fursona's appearance, personality..."
                />
              </div>
            </div>
          )}

          {/* Step 3: About You */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold gradient-text">About You</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-foreground/60 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    min={18}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
                    placeholder="18+"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground/60 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground/60 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground/60 mb-1">
                  Looking For
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Friends", "Dating", "Relationship", "Chat Buddy"].map(
                    (opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleLookingFor(opt)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                          formData.lookingFor.includes(opt)
                            ? "border-neon-pink bg-neon-pink/20 text-neon-pink"
                            : "border-border text-foreground/60 hover:border-neon-pink/50"
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-foreground/60 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors resize-none"
                  placeholder="Tell others about yourself..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Interests */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold gradient-text">
                Your Interests
              </h2>
              <p className="text-sm text-foreground/40">
                Pick what you love. This helps us find your people.
              </p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full text-sm border transition-all ${
                      formData.interests.includes(interest)
                        ? "border-neon-purple bg-neon-purple/20 text-neon-purple"
                        : "border-border text-foreground/60 hover:border-neon-purple/50"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 bg-background border border-border text-foreground py-3 rounded-xl hover:border-neon-purple/50 transition-colors"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 gradient-bg text-white font-bold py-3 rounded-xl glow-button disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 gradient-bg text-white font-bold py-3 rounded-xl glow-button disabled:opacity-50"
              >
                {loading ? "Creating..." : "Join Roarr!"}
              </button>
            )}
          </div>

          <p className="text-center text-foreground/40 text-sm mt-4">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-neon-purple hover:text-neon-pink transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
