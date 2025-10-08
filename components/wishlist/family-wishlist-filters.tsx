"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FamilyWishlistFiltersProps {
  familyMembers: Array<{
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
  currentUserId: string;
  selectedUserId?: string;
  selectedPriority?: string;
}

export function FamilyWishlistFilters({
  familyMembers,
  currentUserId,
  selectedUserId,
  selectedPriority,
}: FamilyWishlistFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleUserChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("userId");
    } else {
      params.set("userId", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePriorityChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("priority");
    } else {
      params.set("priority", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-wrap gap-4">
      <div className="w-64">
        <Select
          value={selectedUserId || "all"}
          onValueChange={handleUserChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All members</SelectItem>
            {familyMembers
              .filter((m) => m.user.id !== currentUserId)
              .map((member) => (
                <SelectItem key={member.user.id} value={member.user.id}>
                  {member.user.name || member.user.email}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-48">
        <Select
          value={selectedPriority || "all"}
          onValueChange={handlePriorityChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
