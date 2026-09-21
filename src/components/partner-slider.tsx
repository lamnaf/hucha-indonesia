"use client";

import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { QuoteIcon, StarIcon } from "lucide-react";

export function PartnerSlider() {
  return (
    <div className="relative px-6 sm:px-12">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-6xl mx-auto"
      >
        <CarouselContent className="-ml-4">
          {testimonials.map((testimonial, index) => (
            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="overflow-hidden border-border/60 shadow-sm transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <QuoteIcon className="text-primary/50 size-6" aria-hidden="true" />
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`size-4 ${
                              i < testimonial.rating
                                ? "text-yellow-400 fill-current"
                                : "text-muted-foreground/30"
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-base leading-relaxed flex-1 mb-6">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <div className="flex items-center gap-4 pt-4 border-t border-border">
                      <div className="relative w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {testimonial.partnerPhoto ? (
                          <Image
                            src={testimonial.partnerPhoto}
                            alt={testimonial.partnerName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <svg
                            className="w-7 h-7 text-muted-foreground/40"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-navy-dark truncate">
                          {testimonial.partnerName}
                        </p>
                        <p className="text-muted-foreground text-sm truncate">
                          {testimonial.partnerBusiness}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4 sm:-left-6" />
        <CarouselNext className="-right-4 sm:-right-6" />
      </Carousel>
    </div>
  );
}

const testimonials = [
  {
    partnerName: "Pak Budi Santoso",
    partnerBusiness: "Bengkel Budi Motor",
    partnerRegion: "Bekasi",
    quote:
      "Sudah dua tahun menjadi distributor HuCha Indonesia. Produknya laris dan kualitasnya konsisten. Proses order juga cepat dan mudah.",
    rating: 5,
    partnerPhoto: null,
  },
  {
    partnerName: "Ibu Sari Wulandari",
    partnerBusiness: "Toko Onderdil Sari",
    partnerRegion: "Bandung",
    quote:
      "Respon tim HuCha sangat cepat, terutama saat stok sedang kosong. Marginnya juga membantu toko kami berkembang.",
    rating: 5,
    partnerPhoto: null,
  },
  {
    partnerName: "Pak Hendra Wijaya",
    partnerBusiness: "Bengkel Jaya Motor",
    partnerRegion: "Tangerang",
    quote:
      "Produk cairan otomotif HuCha banyak direkomendasikan pelanggan. Kualitas oli dan shampo motornya tidak mengecewakan.",
    rating: 4,
    partnerPhoto: null,
  },
  {
    partnerName: "Pak Agus Salim",
    partnerBusiness: "Distributor Agus Motor",
    partnerRegion: "Semarang",
    quote:
      "Program kemitraan distributor HuCha sangat transparan. Ada dukungan promo dan materi penjualan untuk kami pakai.",
    rating: 5,
    partnerPhoto: null,
  },
  {
    partnerName: "Pak Rudi Hartono",
    partnerBusiness: "Bengkel Rudi Sparepart",
    partnerRegion: "Surabaya",
    quote:
      "Pengiriman ke Jawa Timur selalu tepat waktu. Kualitas kampas rem HuCha Racing sangat dipercaya pelanggan balap kami.",
    rating: 5,
    partnerPhoto: null,
  },
  {
    partnerName: "Bu Maya Anggraini",
    partnerBusiness: "Toko Maya Auto Care",
    partnerRegion: "Yogyakarta",
    quote:
      "Produk perawatan kendaraan HuCha Auto Care paling laris di toko kami. Pelanggan menyukai hasilnya yang mengkilap.",
    rating: 4,
    partnerPhoto: null,
  },
];