export const metadata = {
  title: "Kebijakan Privasi | KM ITB Merchandise",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12 max-w-3xl prose prose-slate">
      <h1>Kebijakan Privasi</h1>
      <p className="text-muted-foreground">Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}</p>
      
      <h2>1. Pengumpulan Data</h2>
      <p>
        Kami mengumpulkan informasi identitas pribadi (seperti nama, email, nomor telepon) dan informasi lokasi (alamat pengiriman) 
        hanya ketika Anda memberikannya secara sukarela melalui proses pembuatan akun dan penyelesaian profil.
      </p>

      <h2>2. Penggunaan Data</h2>
      <p>
        Data yang dikumpulkan digunakan secara eksklusif untuk:
      </p>
      <ul>
        <li>Memproses pesanan dan pembayaran Anda.</li>
        <li>Mengirimkan informasi terkait status pesanan dan pengiriman.</li>
        <li>Verifikasi identitas untuk layanan pengajuan subsidi khusus mahasiswa.</li>
      </ul>

      <h2>3. Perlindungan Data</h2>
      <p>
        Kami berkomitmen menjaga keamanan data Anda. Informasi kredensial akun menggunakan otentikasi pihak ketiga (Google OAuth).
        Kami tidak menjual, menyewakan, atau membagikan informasi pribadi Anda kepada pihak ketiga komersial mana pun.
      </p>
    </div>
  )
}
