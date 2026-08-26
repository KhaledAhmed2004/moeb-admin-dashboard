"use client";

import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image, { StaticImageData } from "next/image";

interface ProductCardProps {
  image: string | StaticImageData;
  title: string;
  price: number;
  status?: string;
  onDelete?: () => void;
}

export function ProductCard({
  image,
  title,
  price,
  status = "New",
}: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    console.log("delete");
  };

  return (
    <div className="w-full">
      {/* Card */}
      <div className="overflow-hidden rounded-3xl bg-neutral-800">
        {/* Image */}
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={image as string}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Badge */}
          {status && (
            <p className="mb-3 text-sm font-medium text-neutral-500">
              {status}
            </p>
          )}

          {/* Title */}
          <h3 className="mb-4 text-2xl font-bold text-white">{title}</h3>

          {/* Price and Rating */}
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-amber-500">${price}</span>
            {/* <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
              <span className="text-white font-medium">
                {rating.toFixed(1)}
              </span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Delete Button */}
      {/* <Button
        onClick={handleDelete}
        disabled={isDeleting}
        className="mt-4 w-full rounded-full bg-amber-600 py-6 text-lg font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {isDeleting ? "Deleting..." : "Delete Product"}
      </Button> */}
    </div>
  );
}
