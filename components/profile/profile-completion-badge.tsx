import { Badge } from "@/components/ui/badge";
import { calculateProfileCompletion, getCompletionColor } from "@/lib/utils/profile";
import { CheckCircle2, Circle } from "lucide-react";

interface ProfileCompletionBadgeProps {
  profile: any;
}

export function ProfileCompletionBadge({ profile }: ProfileCompletionBadgeProps) {
  const completion = calculateProfileCompletion(profile);
  const colorClass = getCompletionColor(completion);

  return (
    <div className="flex items-center gap-2">
      {completion === 100 ? (
        <CheckCircle2 className={`h-4 w-4 ${colorClass}`} />
      ) : (
        <Circle className={`h-4 w-4 ${colorClass}`} />
      )}
      <span className={`text-sm font-medium ${colorClass}`}>
        {completion}% complete
      </span>
    </div>
  );
}
