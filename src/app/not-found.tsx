import Link from "next/link";
import { CompassIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <Link href="/" aria-label="Ke beranda">
            <BrandLogo />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="flex max-w-lg flex-col items-center gap-5 text-center">
          <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-full">
            <CompassIcon className="size-8" aria-hidden="true" />
          </div>
          <p className="text-primary text-5xl font-bold tracking-tight sm:text-6xl">
            404
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Halaman tidak ditemukan
          </h1>
          <p className="text-muted-foreground">
            Maaf, halaman yang Anda cari mungkin telah dipindahkan atau tidak
            tersedia. Silakan kembali ke beranda atau jelajahi halaman lain.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/produk">Lihat Produk</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
