"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { SPECIES_OPTIONS, INTEREST_OPTIONS, LOOKING_FOR_OPTIONS } from "@/lib/constants";
import { useToast } from "@/components/Toast";

export default function ProfilePage() {
  const { data: session } = useSession();
  const userId = (session?.user as { id: string })?.id;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    fursonaName: "",
    species: "",
    fursonaType: "furry",
    fursonaDescription: "",
    age: "",
    gender: "",
    lookingFor: [] as string[],
    interests: [] as string[],
    location: "",
    bio: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        const user = await res.json();
        setFormData({
          displayName: user.displayName || "",
          fursonaName: user.fursona?.name || "",
          species: user.fursona?.species || "",
          fursonaType: user.fursona?.fursonaType || "furry",
          fursonaDescription: user.fursona?.description || "",
          age: user.age?.toString() || "",
          gender: user.gender || "",
          lookingFor: user.lookingFor || [],
          interests: user.interests || [],
          location: user.location || "",
          bio: user.bio || "",
        });
      } else {
        toast("Failed to load profile", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId, fetchProfile]);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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

      if (res.ok) {
        toast("Profile saved!", "success");
      } else {
        toast("Failed to save profile", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-9rem)]">
        <div className="text-xl animate-pulse text-foreground/40">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold gradient-text">Your Profile</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-foreground/40 hover:text-danger transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Avatar */}
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-purple/30 to-neon-pink/30 border-2 border-neon-purple/50 flex items-center justify-center text-5xl" aria-hidden="true">
          {"\u{1F43E}"}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 card-shadow">
        <h2 className="font-bold text-neon-purple">Basic Info</h2>

        <div>
          <label htmlFor="displayName" className="block text-sm text-foreground/60 mb-1">Display Name</label>
          <input
            id="displayName"
            type="text"
            value={formData.displayName}
            onChange={(e) => updateField("displayName", e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="age" className="block text-sm text-foreground/60 mb-1">Age</label>
            <input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => updateField("age", e.target.value)}
              min={18}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm text-foreground/60 mb-1">Gender</label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => updateField("gender", e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
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
          <label htmlFor="location" className="block text-sm text-foreground/60 mb-1">Location</label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
            placeholder="City, Country"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm text-foreground/60 mb-1">Bio</label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            rows={3}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple transition-colors resize-none"
          />
        </div>

        <fieldset>
          <legend className="block text-sm text-foreground/60 mb-1">Looking For</legend>
          <div className="flex flex-wrap gap-2">
            {LOOKING_FOR_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleLookingFor(opt)}
                aria-pressed={formData.lookingFor.includes(opt)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  formData.lookingFor.includes(opt)
                    ? "border-neon-pink bg-neon-pink/20 text-neon-pink"
                    : "border-border text-foreground/60 hover:border-neon-pink/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 card-shadow">
        <h2 className="font-bold text-neon-pink">Fursona</h2>

        <div>
          <label htmlFor="fursonaName" className="block text-sm text-foreground/60 mb-1">Fursona Name</label>
          <input
            id="fursonaName"
            type="text"
            value={formData.fursonaName}
            onChange={(e) => updateField("fursonaName", e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
          />
        </div>

        <fieldset>
          <legend className="block text-sm text-foreground/60 mb-1">Type</legend>
          <div className="flex gap-2">
            {(["furry", "therian", "otherkin"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateField("fursonaType", type)}
                aria-pressed={formData.fursonaType === type}
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
        </fieldset>

        <div>
          <label htmlFor="species" className="block text-sm text-foreground/60 mb-1">Species</label>
          <select
            id="species"
            value={formData.species}
            onChange={(e) => updateField("species", e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple transition-colors"
          >
            <option value="">Select</option>
            {SPECIES_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fursonaDesc" className="block text-sm text-foreground/60 mb-1">Description</label>
          <textarea
            id="fursonaDesc"
            value={formData.fursonaDescription}
            onChange={(e) => updateField("fursonaDescription", e.target.value)}
            rows={3}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple transition-colors resize-none"
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 card-shadow">
        <h2 className="font-bold text-neon-purple">Interests</h2>
        <fieldset>
          <legend className="sr-only">Select your interests</legend>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                aria-pressed={formData.interests.includes(interest)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  formData.interests.includes(interest)
                    ? "border-neon-purple bg-neon-purple/20 text-neon-purple"
                    : "border-border text-foreground/60 hover:border-neon-purple/50"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full gradient-bg text-white font-bold py-3 rounded-xl glow-button disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
