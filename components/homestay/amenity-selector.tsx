"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { amenityIcons, getAllCategories } from "@/lib/amenity-icons";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AmenitySelectorProps {
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
  className?: string;
}

export function AmenitySelector({
  selectedAmenities,
  onChange,
  className,
}: AmenitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const categories = getAllCategories();

  const handleToggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      onChange(selectedAmenities.filter((a) => a !== amenity));
    } else {
      onChange([...selectedAmenities, amenity]);
    }
  };

  const filteredAmenities = Object.entries(amenityIcons)
    .filter(([key]) => key !== "default")
    .filter(
      ([key, value]) =>
        key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        value.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm kiếm tiện nghi..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {searchQuery ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filteredAmenities.map(([key, { icon: Icon, label }]) => (
            <div key={key} className="flex items-start space-x-2">
              <Checkbox
                id={`amenity-${key}`}
                checked={selectedAmenities.includes(key)}
                onCheckedChange={() => handleToggleAmenity(key)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor={`amenity-${key}`}
                  className="flex items-center gap-1.5 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </Label>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Tabs defaultValue={categories[0]}>
          <TabsList className="w-full h-auto flex flex-wrap">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="flex-grow"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="pt-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(amenityIcons)
                  .filter(([_, value]) => value.category === category)
                  .map(([key, { icon: Icon, label }]) => (
                    <div key={key} className="flex items-start space-x-2">
                      <Checkbox
                        id={`amenity-${key}`}
                        checked={selectedAmenities.includes(key)}
                        onCheckedChange={() => handleToggleAmenity(key)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={`amenity-${key}`}
                          className="flex items-center gap-1.5 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <Icon className="h-4 w-4 text-primary" />
                          {label}
                        </Label>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
