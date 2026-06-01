export const metadata = {
  title: "Syarat & Ketentuan | KM ITB Merchandise",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 max-w-3xl prose prose-slate">
      <h1>Syarat dan Ketentuan Penggunaan</h1>
      <p className="text-muted-foreground">Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}</p>
      
      <h2>1. Pendahuluan</h2>
      <p>
        Selamat datang di platform E-Commerce KM ITB Merchandise. Dengan mengakses dan menggunakan platform ini, 
        Anda setuju untuk terikat dengan Syarat dan Ketentuan berikut.
      </p>

      <h2>2. Definisi</h2>
      <p>
        "Platform" merujuk pada website e-commerce merchandise resmi KM ITB.<br/>
        "Pengguna" merujuk pada siapa saja yang mengakses dan menggunakan platform ini.<br/>
        "Produk" merujuk pada barang-barang fisik berupa merchandise yang dijual di platform ini.
      </p>

      <h2>3. Pembelian dan Pembayaran</h2>
      <ul>
        <li>Semua harga yang tercantum adalah dalam mata uang Rupiah (IDR).</li>
        <li>Pembayaran dilakukan melalui gerbang pembayaran (payment gateway) resmi yang telah disediakan.</li>
        <li>Terdapat biaya tambahan administrasi layanan pembayaran (sebesar 2%) yang dibebankan kepada pembeli.</li>
        <li>Pesanan akan diproses setelah pembayaran berhasil diverifikasi.</li>
      </ul>

      <h2>4. Pengiriman dan Pengambilan</h2>
      <p>
        Pengguna dapat memilih metode pengiriman ke alamat tujuan atau pengambilan langsung (pickup) sesuai ketersediaan. 
        Biaya pengiriman akan dihitung otomatis saat proses checkout.
      </p>

      <h2>5. Subsidi dan Diskon</h2>
      <p>
        Fitur subsidi atau cicilan merupakan fasilitas yang disediakan atas kebijakan internal KM ITB untuk memfasilitasi mahasiswa. 
        Pengajuan subsidi wajib melampirkan dokumen persyaratan yang diminta dan sepenuhnya merupakan wewenang admin untuk menyetujui atau menolak pengajuan tersebut.
      </p>
    </div>
  )
}
