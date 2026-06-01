"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { completeProfile } from "./actions"
import Link from "next/link"
import { useTransition } from "react"

export default function CompleteProfilePage() {
  const [isPending, startTransition] = useTransition()

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await completeProfile(formData)
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Lengkapi Profil Anda</h1>
          <p className="text-muted-foreground">
            Mohon lengkapi data diri dan alamat pengiriman Anda sebelum melanjutkan.
          </p>
        </div>

        <form action={onSubmit} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Data Diri</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" name="name" required placeholder="Masukkan nama lengkap" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waNumber">Nomor WhatsApp</Label>
                <Input id="waNumber" name="waNumber" required placeholder="081234567890" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipe Pengguna</Label>
              <RadioGroup name="userType" defaultValue="MAHASISWA" className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MAHASISWA" id="mahasiswa" />
                  <Label htmlFor="mahasiswa">Mahasiswa ITB</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="UMUM" id="umum" />
                  <Label htmlFor="umum">Umum</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Alamat Pengiriman Utama</h2>
            <div className="space-y-2">
              <Label htmlFor="street">Jalan & Detail (No. Rumah, RT/RW)</Label>
              <Input id="street" name="street" required placeholder="Jl. Ganesha No. 10" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="district">Kecamatan</Label>
                <Input id="district" name="district" required placeholder="Coblong" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Kota/Kabupaten</Label>
                <Input id="city" name="city" required placeholder="Kota Bandung" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provinsi</Label>
                <Input id="province" name="province" required placeholder="Jawa Barat" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Kode Pos</Label>
                <Input id="postalCode" name="postalCode" required placeholder="40132" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Persetujuan</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox id="terms" name="terms" required />
                <Label htmlFor="terms" className="leading-snug">
                  Saya menyetujui <Link href="/terms" className="text-primary hover:underline">Syarat & Ketentuan</Link> penggunaan platform.
                </Label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox id="privacy" name="privacy" required />
                <Label htmlFor="privacy" className="leading-snug">
                  Saya menyetujui <Link href="/privacy" className="text-primary hover:underline">Kebijakan Privasi</Link> terkait data pribadi saya.
                </Label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox id="disclaimer" name="disclaimer" required />
                <Label htmlFor="disclaimer" className="leading-snug">
                  Saya memahami bahwa Kemenwir KM ITB <Link href="/disclaimer" className="text-primary hover:underline">bukanlah entitas bisnis komersial</Link>.
                </Label>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Profil & Lanjutkan"}
          </Button>
        </form>
      </div>
    </div>
  )
}
