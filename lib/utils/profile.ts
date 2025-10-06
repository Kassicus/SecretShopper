/**
 * Calculate profile completion percentage
 */
export function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;

  const fields = [
    profile.shoeSize,
    profile.pantSize,
    profile.shirtSize,
    profile.ringSize,
    profile.favoriteColors && profile.favoriteColors.length > 0,
    profile.vehicleMake,
    profile.hobbies && profile.hobbies.length > 0,
    profile.interests && profile.interests.length > 0,
    profile.birthday,
  ];

  const filledFields = fields.filter(Boolean).length;
  return Math.round((filledFields / fields.length) * 100);
}

/**
 * Get completion status color
 */
export function getCompletionColor(percentage: number): string {
  if (percentage >= 75) return "text-green-600";
  if (percentage >= 50) return "text-yellow-600";
  if (percentage >= 25) return "text-orange-600";
  return "text-red-600";
}
