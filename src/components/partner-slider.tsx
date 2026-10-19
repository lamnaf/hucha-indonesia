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
          {partners.map((partner, index) => (
            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="overflow-hidden border-border/60 shadow-sm transition-all duration-300 hover:shadow-lg aspect-[4/3] flex flex-col">
                  <CardContent className="p-0 flex flex-col h-full relative">
                    <Image
                      src={partner.image}
                      alt={`Partner HUCHA ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
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

const partners = [
  { image: "/tentang-hucha/48.png" },
  { image: "/tentang-hucha/49.png" },
  { image: "/tentang-hucha/50.png" },
  { image: "/tentang-hucha/51.png" },
  { image: "/tentang-hucha/52.png" },
  { image: "/tentang-hucha/53.png" },
  { image: "/tentang-hucha/54.png" },
  { image: "/tentang-hucha/55.png" },
  { image: "/tentang-hucha/56.png" },
  { image: "/tentang-hucha/57.png" },
  { image: "/tentang-hucha/58.png" },
  { image: "/tentang-hucha/59.png" },
  { image: "/tentang-hucha/60.png" },
  { image: "/tentang-hucha/61.png" },
  { image: "/tentang-hucha/62.png" },
  { image: "/tentang-hucha/63.png" },
  { image: "/tentang-hucha/64.png" },
  { image: "/tentang-hucha/65.png" },
];
