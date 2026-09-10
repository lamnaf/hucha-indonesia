import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <section className="w-full max-w-md space-y-8">
        <header className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            HuCha Indonesia
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masuk ke panel admin
          </p>
        </header>
        <LoginForm />
      </section>
    </main>
  );
}
