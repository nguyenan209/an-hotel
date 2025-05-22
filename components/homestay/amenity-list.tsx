"use client";

import { getAmenityIcon } from "@/lib/amenity-icons";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AmenityListProps {
  amenities: string[];
  className?: string;
  showTooltip?: boolean;
  columns?: 2 | 3 | 4 | 5;
}

export function AmenityList({
  amenities,
  className,
  showTooltip = true,
  columns = 4,
}: AmenityListProps) {
  const getColumnClass = () => {
    switch (columns) {
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2 md:grid-cols-3";
      case 5:
        return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
      case 4:
      default:
        return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  return (
    <div className={cn("grid gap-4", getColumnClass(), className)}>
      {amenities.map((amenity) => {
        const { icon: Icon, label, description } = getAmenityIcon(amenity);

        const amenityItem = (
          <div
            key={amenity}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <div className="text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm">{amenity}</span>
          </div>
        );

        if (showTooltip && description) {
          return (
            <TooltipProvider key={amenity}>
              <Tooltip>
                <TooltipTrigger asChild>{amenityItem}</TooltipTrigger>
                <TooltipContent>
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return amenityItem;
      })}
    </div>
  );
}
