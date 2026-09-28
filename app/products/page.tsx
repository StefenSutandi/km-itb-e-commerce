import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Search, ShoppingBag } from "lucide-react";
import {
  productRepository,
  isMockFallbackAllowed,
} from "@/lib/repositories/product.repository";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import "../portal.css";

export const metadata = {
  title: "Katalog toko | KKP ITB",
  description: "Jelajahi produk yang tersedia di katalog toko KKP ITB.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category =
    typeof params.category === "string" ? params.category : undefined;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  let products = await productRepository.getPublishedProducts(category, query);
  let isDemo = false;
  if (products.length === 0 && isMockFallbackAllowed()) {
    isDemo = true;
    products = mockProducts.filter(
      (product) =>
        (!category || category === "ALL" || product.category === category) &&
        (!query ||
          `${product.name} ${product.description}`
            .toLocaleLowerCase("id")
            .includes(query.toLocaleLowerCase("id"))),
    );
  }
  return (
    <div className="kkp-portal">
      <section className="portal-container catalog-page">
        <Link href="/#layanan" className="catalog-back">
          <ArrowLeft size={14} /> Kembali ke unit usaha
        </Link>
        <div className="catalog-heading">
          <div>
            <span className="eyebrow">TOKO KKP ITB</span>
            <h1>Katalog toko.</h1>
            <p>Temukan produk, lihat detailnya, lalu lanjutkan belanja Anda.</p>
          </div>
          <ShoppingBag size={32} />
        </div>
        <form action="/products" className="catalog-search">
          <Search size={18} />
          <input
            name="q"
            defaultValue={query}
            placeholder="Cari nama atau deskripsi produk…"
            aria-label="Cari produk"
          />
          {category && <input type="hidden" name="category" value={category} />}
          <button className="portal-button primary" type="submit">
            Cari produk
          </button>
        </form>
        <div className="catalog-caption">
          <span>
            {products.length} produk{query ? ` untuk “${query}”` : ""}
          </span>
          {query && <Link href="/products">Hapus pencarian</Link>}
        </div>
        {isDemo && (
          <p className="catalog-notice">
            Katalog contoh — produk ini merupakan data demonstrasi, bukan stok
            aktual waserda.
          </p>
        )}
        {products.length ? (
          <div className="catalog-grid">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="catalog-card"
              >
                <div className="catalog-image">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <ShoppingBag size={48} />
                  )}
                </div>
                <div className="catalog-card-body">
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  <div>
                    <strong>{formatCurrency(product.price)}</strong>
                    <span>
                      Lihat produk <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <ShoppingBag size={32} />
            <h2>
              {query ? "Produk belum ditemukan." : "Katalog belum tersedia."}
            </h2>
            <p>
              {query
                ? "Coba nama produk lain atau hapus pencarian Anda."
                : "Produk akan muncul setelah katalog tersedia. Silakan cek kembali nanti."}
            </p>
            {query && (
              <Link href="/products" className="portal-button secondary">
                Lihat semua produk
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
