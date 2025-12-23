'use client';

import Image from "next/image";
import { getOptimizedImageProps } from "@/lib/image-utils";

interface HotelImageGalleryProps {
  image: string;
  alt: string;
}

export default function HotelImageGallery({ image, alt }: HotelImageGalleryProps) {
  return (
    <div className="relative w-full h-56 rounded-3xl overflow-hidden shadow-soft group">
      <Image
        src={image}
        alt={alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 600px"
        priority
        {...getOptimizedImageProps(image)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/50 backdrop-blur-sm" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/50 backdrop-blur-sm" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/50 backdrop-blur-sm" />
      </div>
      <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 border border-white/10">
        <span className="material-icons-round text-[14px]">photo_library</span> 1/12
      </div>
    </div>
  );
}
