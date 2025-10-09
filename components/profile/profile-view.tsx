import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Car, Heart, AlertCircle, FileText } from "lucide-react";

interface ProfileViewProps {
  profile: {
    shoeSize?: string | null;
    pantSize?: string | null;
    shirtSize?: string | null;
    dressSize?: string | null;
    ringSize?: string | null;
    favoriteColors?: any;
    vehicleMake?: string | null;
    vehicleModel?: string | null;
    vehicleYear?: number | null;
    hobbies?: any;
    interests?: any;
    allergies?: string | null;
    dietaryRestrictions?: string | null;
    notes?: string | null;
    birthday?: Date | null;
    anniversary?: Date | null;
  } | null;
  userName?: string;
}

export function ProfileView({ profile, userName }: ProfileViewProps) {
  if (!profile) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          {userName} hasn't set up their profile yet.
        </p>
      </div>
    );
  }

  const favoriteColors = profile.favoriteColors as string[] | null;
  const hobbies = profile.hobbies as string[] | null;
  const interests = profile.interests as string[] | null;

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    // Use UTC methods to avoid timezone conversion issues
    const d = new Date(date);
    const month = d.toLocaleDateString("en-US", {
      month: "long",
      timeZone: "UTC",
    });
    const day = d.getUTCDate();
    return `${month} ${day}`;
  };

  return (
    <div className="space-y-6">
      {/* Sizes */}
      {(profile.shoeSize || profile.pantSize || profile.shirtSize || profile.dressSize || profile.ringSize) && (
        <Card>
          <CardHeader>
            <CardTitle>Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {profile.shoeSize && (
                <div>
                  <p className="text-sm text-muted-foreground">Shoe</p>
                  <p className="font-medium">{profile.shoeSize}</p>
                </div>
              )}
              {profile.pantSize && (
                <div>
                  <p className="text-sm text-muted-foreground">Pant</p>
                  <p className="font-medium">{profile.pantSize}</p>
                </div>
              )}
              {profile.shirtSize && (
                <div>
                  <p className="text-sm text-muted-foreground">Shirt</p>
                  <p className="font-medium">{profile.shirtSize}</p>
                </div>
              )}
              {profile.dressSize && (
                <div>
                  <p className="text-sm text-muted-foreground">Dress</p>
                  <p className="font-medium">{profile.dressSize}</p>
                </div>
              )}
              {profile.ringSize && (
                <div>
                  <p className="text-sm text-muted-foreground">Ring</p>
                  <p className="font-medium">{profile.ringSize}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Colors */}
      {favoriteColors && favoriteColors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Favorite Colors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {favoriteColors.map((color) => (
                <Badge key={color} variant="secondary">
                  {color}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle */}
      {(profile.vehicleMake || profile.vehicleModel || profile.vehicleYear) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {profile.vehicleYear && `${profile.vehicleYear} `}
              {profile.vehicleMake && `${profile.vehicleMake} `}
              {profile.vehicleModel}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Hobbies & Interests */}
      {((hobbies && hobbies.length > 0) || (interests && interests.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle>Hobbies & Interests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hobbies && hobbies.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Hobbies</p>
                <div className="flex flex-wrap gap-2">
                  {hobbies.map((hobby) => (
                    <Badge key={hobby} variant="outline">
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {interests && interests.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="outline">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Health & Dietary */}
      {(profile.allergies || profile.dietaryRestrictions) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Health & Dietary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.allergies && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                <p>{profile.allergies}</p>
              </div>
            )}
            {profile.dietaryRestrictions && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dietary Restrictions</p>
                <p>{profile.dietaryRestrictions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Important Dates */}
      {(profile.birthday || profile.anniversary) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile.birthday && (
              <div>
                <p className="text-sm text-muted-foreground">Birthday</p>
                <p className="font-medium">{formatDate(profile.birthday)}</p>
              </div>
            )}
            {profile.anniversary && (
              <div>
                <p className="text-sm text-muted-foreground">Anniversary</p>
                <p className="font-medium">{formatDate(profile.anniversary)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {profile.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{profile.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
