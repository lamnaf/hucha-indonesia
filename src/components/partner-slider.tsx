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

const partnerPhotos = [
  {
    title: "Mitra Bengkel & Toko Resmi",
    location: "Jakarta & Sekitarnya",
    image: "/tentang-hucha/48.png",
  },
  {
    title: "Distribusi & Jaringan Mitra",
    location: "Jawa Timur",
    image: "/tentang-hucha/55.png",
  },
  {
    title: "Kolaborasi Bengkel Modern",
    location: "Jawa Tengah & Yogyakarta",
    image: "/tentang-hucha/57.png",
  },
  {
    title: "Dukungan Kemitraan Jangka Panjang",
    location: "Seluruh Indonesia",
    image: "/tentang-hucha/64.png",
  },
];

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
          {partnerPhotos.map((partner, index) => (
            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="overflow-hidden border-border/60 shadow-sm transition-all duration-300 hover:shadow-lg">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    <Image
                      src={partner.image}
                      alt={partner.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-lg text-navy-dark mb-1">
                      {partner.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {partner.location}
                    </p>
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