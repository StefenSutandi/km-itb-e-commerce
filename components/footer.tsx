import Link from "next/link";

export function Footer() {
  return (
    <footer className="kkp-footer">
      <div className="kkp-footer-inner">
        <div>
          <Link className="kkp-wordmark" href="/">
            <span className="kkp-mark">
              K<span />
            </span>
            KKP ITB
          </Link>
          <p>Koperasi Keluarga Pegawai ITB</p>
          <small>Jl. Ganesa No. 10, Bandung</small>
        </div>
        <div className="kkp-footer-links">
          <Link href="/#layanan">Unit usaha</Link>
          <Link href="/products">Katalog toko</Link>
          <Link href="/#bantuan">Bantuan</Link>
        </div>
      </div>
      <div className="kkp-footer-bottom">
        <span>© {new Date().getFullYear()} KKP ITB</span>
        <span>Bandung · Jatinangor</span>
      </div>
    </footer>
  );
}
