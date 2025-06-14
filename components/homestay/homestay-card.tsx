"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Homestay } from "@prisma/client";
import { motion } from "framer-motion";

interface HomestayCardProps {
  homestay: Homestay;
}

export function HomestayCard({ homestay }: HomestayCardProps) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={homestay.images[0] || "/placeholder.svg"}
            alt={homestay.name}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardContent className="flex-1 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              {homestay.address}
            </div>
            <div className="flex items-center">
              <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{homestay.rating}</span>
            </div>
          </div>
          <h3 className="mt-2 text-lg font-semibold leading-tight line-clamp-1">
            {homestay.name}
          </h3>
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <Users className="mr-1 h-4 w-4" />
            <span>Tối đa {homestay.maxGuests} khách</span>
          </div>
          <p className="mt-2 text-lg font-bold">
            {formatCurrency(homestay.price)}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / đêm
            </span>
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Link href={`/homestays/${homestay.id}`} className="w-full">
            <Button className="w-full">Xem chi tiết</Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
