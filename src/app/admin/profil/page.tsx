import type { Metadata } from "next";

import { requirePageAuth } from "@/domain/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/admin";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = {
  title: "Profil Saya",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await requirePageAuth();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground text-sm">
          Kelola identitas akun dan kata sandi Anda.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Informasi Akun</CardTitle>
          <Badge variant="secondary">Super Admin</Badge>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Nama</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Terdaftar</dt>
              <dd className="font-medium">{formatDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Terakhir Masuk</dt>
              <dd className="font-medium">
                {user.lastLoginAt
                  ? formatDateTime(user.lastLoginAt)
                  : "Belum pernah"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm initialName={user.name} initialEmail={user.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubah Kata Sandi</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
