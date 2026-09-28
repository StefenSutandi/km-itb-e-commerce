import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Layers3,
  MousePointer2,
  Route,
  ShieldCheck,
} from "lucide-react";
import { ServiceExplorer } from "@/components/service-explorer";
import "./portal.css";

export default function HomePage() {
  return (
    <div className="kkp-portal">
      <section className="portal-hero portal-container">
        <a className="hero-note" href="#layanan">
          <span className="note-dot" /> Koperasi Keluarga Pegawai ITB{" "}
          <ArrowUpRight size={14} />
        </a>
        <h1>
          Dekat dengan keseharian.
          <br />
          <span>Terhubung dalam satu koperasi.</span>
        </h1>
        <div className="hero-bottom">
          <p>
            Dari kebutuhan harian sampai rencana perjalanan.
            <br className="desktop-break" /> Temukan layanan KKP ITB, mulai dari
            satu tempat.
          </p>
          <a className="portal-button primary" href="#layanan">
            Jelajahi layanan <ArrowDown size={16} />
          </a>
        </div>
        <ServiceExplorer />
        <div className="unit-index">
          <span>SATU KOPERASI, EMPAT UNIT USAHA</span>
          <p>
            Simpan pinjam <i /> Waserda <i /> Kantin <i /> Rental & travel
          </p>
        </div>
      </section>

      <section className="portal-section portal-container" id="cara-akses">
        <div className="section-intro">
          <span className="eyebrow">01 / LEBIH MUDAH DIAKSES</span>
          <h2>
            Mulai dari yang
            <br />
            Anda butuhkan.
          </h2>
          <p>
            Setiap unit punya kebutuhan berbeda. Pilih layanan, lihat
            keterangannya, lalu lanjutkan sesuai kebutuhan Anda.
          </p>
        </div>
        <div className="steps-grid">
          <article>
            <MousePointer2 />
            <span className="step-number">01</span>
            <h3>Pilih unit usaha</h3>
            <p>
              Belanja, simpan pinjam, makan siang, atau perjalanan. Semuanya
              mudah ditemukan.
            </p>
          </article>
          <article>
            <Route />
            <span className="step-number">02</span>
            <h3>Kenali layanannya</h3>
            <p>Lihat cakupan layanan dan lokasi unit sebelum melanjutkan.</p>
          </article>
          <article>
            <ShieldCheck />
            <span className="step-number">03</span>
            <h3>Lanjut dengan jelas</h3>
            <p>
              Akses katalog yang tersedia. Layanan yang masih disiapkan ditandai
              secara terbuka.
            </p>
          </article>
        </div>
      </section>

      <section
        className="portal-section portal-container about-section"
        id="tentang"
      >
        <div>
          <span className="eyebrow">02 / TUMBUH BERSAMA</span>
          <h2>
            Koperasi yang mengikuti
            <br />
            ritme keseharian kita.
          </h2>
          <p>
            KKP ITB hadir melalui beragam unit usaha di lingkungan kampus.
            Portal ini menjadi langkah awal untuk mempertemukan layanan-layanan
            tersebut dalam pengalaman yang lebih sederhana.
          </p>
          <a className="text-link" href="#layanan">
            Kenali unit usaha <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="principles">
          <Layers3 size={28} />
          <h3>
            Beragam layanan.
            <br />
            Satu pintu masuk.
          </h3>
          <ul>
            <li>
              <Check size={16} /> Pilihan unit yang mudah dikenali
            </li>
            <li>
              <Check size={16} /> Informasi lokasi dalam satu tampilan
            </li>
            <li>
              <Check size={16} /> Pengembangan bertahap sesuai kebutuhan
            </li>
          </ul>
          <span>Dirancang untuk keluarga besar ITB.</span>
        </div>
      </section>

      <section className="portal-container help-section" id="bantuan">
        <div>
          <span className="eyebrow">BUTUH ARAH?</span>
          <h2>Kebutuhan Anda, mulai di sini.</h2>
          <p>
            Pilih unit di atas untuk melihat informasi layanan. Untuk ketentuan
            layanan yang belum tersedia online, hubungi pengelola unit secara
            langsung.
          </p>
        </div>
        <Link className="portal-button secondary" href="/products">
          Buka katalog toko <ArrowUpRight size={16} />
        </Link>
      </section>
    </div>
  );
}
