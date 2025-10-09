"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";

interface ProfileFormProps {
  familyId: string;
  initialData?: any;
}

export function ProfileForm({ familyId, initialData }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [colors, setColors] = useState<string[]>(
    initialData?.favoriteColors || []
  );
  const [hobbies, setHobbies] = useState<string[]>(
    initialData?.hobbies || []
  );
  const [interests, setInterests] = useState<string[]>(
    initialData?.interests || []
  );
  const [newColor, setNewColor] = useState("");
  const [newHobby, setNewHobby] = useState("");
  const [newInterest, setNewInterest] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      shoeSize: initialData?.shoeSize || "",
      pantSize: initialData?.pantSize || "",
      shirtSize: initialData?.shirtSize || "",
      dressSize: initialData?.dressSize || "",
      ringSize: initialData?.ringSize || "",
      vehicleMake: initialData?.vehicleMake || "",
      vehicleModel: initialData?.vehicleModel || "",
      vehicleYear: initialData?.vehicleYear || null,
      allergies: initialData?.allergies || "",
      dietaryRestrictions: initialData?.dietaryRestrictions || "",
      notes: initialData?.notes || "",
      birthday: initialData?.birthday
        ? new Date(initialData.birthday).toISOString().split("T")[0]
        : "",
      anniversary: initialData?.anniversary
        ? new Date(initialData.anniversary).toISOString().split("T")[0]
        : "",
    },
  });

  const onSubmit = async (data: ProfileInput) => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          familyId,
          favoriteColors: colors,
          hobbies,
          interests,
          vehicleYear: data.vehicleYear ? Number(data.vehicleYear) : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to update profile");
        return;
      }

      setSuccess("Profile updated successfully");
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors([...colors, newColor]);
      setNewColor("");
    }
  };

  const removeColor = (color: string) => {
    setColors(colors.filter((c) => c !== color));
  };

  const addHobby = () => {
    if (newHobby && !hobbies.includes(newHobby)) {
      setHobbies([...hobbies, newHobby]);
      setNewHobby("");
    }
  };

  const removeHobby = (hobby: string) => {
    setHobbies(hobbies.filter((h) => h !== hobby));
  };

  const addInterest = () => {
    if (newInterest && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sizes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Sizes</CardTitle>
          <CardDescription>Clothing and accessory sizes</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shoeSize">Shoe Size</Label>
            <Input id="shoeSize" {...register("shoeSize")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pantSize">Pant Size</Label>
            <Input id="pantSize" {...register("pantSize")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shirtSize">Shirt Size</Label>
            <Input id="shirtSize" {...register("shirtSize")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dressSize">Dress Size</Label>
            <Input id="dressSize" {...register("dressSize")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ringSize">Ring Size</Label>
            <Input id="ringSize" {...register("ringSize")} />
          </div>
        </CardContent>
      </Card>

      {/* Colors Section */}
      <Card>
        <CardHeader>
          <CardTitle>Favorite Colors</CardTitle>
          <CardDescription>Add your favorite colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
            />
            <Button type="button" onClick={addColor}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <div
                key={color}
                className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground"
              >
                {color}
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Section */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
          <CardDescription>For car accessories and gifts</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="vehicleMake">Make</Label>
            <Input
              id="vehicleMake"
              placeholder="Toyota"
              {...register("vehicleMake")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleModel">Model</Label>
            <Input
              id="vehicleModel"
              placeholder="Camry"
              {...register("vehicleModel")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleYear">Year</Label>
            <Input
              id="vehicleYear"
              type="number"
              placeholder="2020"
              {...register("vehicleYear", { valueAsNumber: true })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Hobbies & Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Hobbies & Interests</CardTitle>
          <CardDescription>What do you enjoy?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Hobbies</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="e.g., Photography, Cooking"
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHobby())}
              />
              <Button type="button" onClick={addHobby}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {hobbies.map((hobby) => (
                <div
                  key={hobby}
                  className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground"
                >
                  {hobby}
                  <button
                    type="button"
                    onClick={() => removeHobby(hobby)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Interests</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="e.g., Technology, Travel"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
              />
              <Button type="button" onClick={addInterest}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <div
                  key={interest}
                  className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health & Dietary */}
      <Card>
        <CardHeader>
          <CardTitle>Health & Dietary</CardTitle>
          <CardDescription>Important information for gifts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              placeholder="List any allergies..."
              {...register("allergies")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
            <Textarea
              id="dietaryRestrictions"
              placeholder="Vegetarian, vegan, gluten-free, etc."
              {...register("dietaryRestrictions")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Important Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Important Dates</CardTitle>
          <CardDescription>Never forget a special day</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Input id="birthday" type="date" {...register("birthday")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anniversary">Anniversary</Label>
            <Input id="anniversary" type="date" {...register("anniversary")} />
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>Any other preferences or information</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any additional notes or preferences..."
            rows={4}
            {...register("notes")}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
