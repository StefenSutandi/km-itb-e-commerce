"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Store,
  Wallet,
  Utensils,
  Bus,
  MapPin,
  ChevronDown,
  Search,
  CircleHelp,
  PanelLeft,
  ShoppingBag,
} from "lucide-react";

const services = [
  {
    id: "waserda",
    name: "Waserda",
    icon: Store,
    subtitle: "Kebutuhan harian, dekat dari kampus.",
    description:
      "Kenali unit waserda KKP ITB di LFM, CRCS, dan Asrama Jatinangor. Katalog toko yang tersedia dapat diakses dari portal ini.",
    items: ["LFM", "CRCS", "Asrama Jatinangor"],
    label: "LOKASI WASERDA",
    detail: "Stok dan harga per lokasi belum terhubung ke portal.",
  },
  {
    id: "simpan-pinjam",
    name: "Simpan pinjam",
    icon: Wallet,
    subtitle: "Ruang untuk rencana keuangan anggota.",
    description:
      "Informasi unit simpan pinjam dalam satu pintu masuk. Persyaratan, ketentuan simpanan, dan pengajuan pinjaman perlu dikonfirmasi kepada pengelola unit.",
    items: ["Simpanan anggota", "Informasi pinjaman", "Ketentuan keanggotaan"],
    label: "KEBUTUHAN ANGGOTA",
    detail: "Saldo, angsuran, dan pengajuan online belum tersedia.",
  },
  {
    id: "kantin",
    name: "Kantin",
    icon: Utensils,
    subtitle: "Sela hari yang lebih menyenangkan.",
    description:
      "Temukan informasi unit kantin KKP ITB. Daftar tenant, menu, serta cara pemesanan akan mengikuti layanan yang ditetapkan pengelola.",
    items: ["Informasi tenant", "Menu harian", "Pemesanan makanan"],
    label: "CAKUPAN YANG DIRENCANAKAN",
    detail: "Menu, harga, dan pemesanan online belum tersedia.",
  },
  {
    id: "rental-travel",
    name: "Rental & travel",
    icon: Bus,
    subtitle: "Menemani perjalanan berikutnya.",
    description:
      "Pintu masuk untuk kebutuhan rental dan perjalanan. Jenis kendaraan, rute, jadwal, serta ketentuan pemesanan perlu dikonfirmasi kepada pengelola.",
    items: ["Rental kendaraan", "Kebutuhan perjalanan", "Informasi reservasi"],
    label: "KEBUTUHAN PERJALANAN",
    detail: "Ketersediaan armada dan reservasi online belum tersedia.",
  },
];

export function ServiceExplorer() {
  const [active, setActive] = useState("waserda");
  const [location, setLocation] = useState("Semua lokasi");
  const [query, setQuery] = useState("");
  const service = services.find((item) => item.id === active)!;
  const Icon = service.icon;
  const locations =
    service.id === "waserda" && location !== "Semua lokasi"
      ? service.items.filter((item) => item === location)
      : service.items;
  const items = locations.filter((item) =>
    item.toLocaleLowerCase("id").includes(query.toLocaleLowerCase("id")),
  );

  function selectService(id: string) {
    setActive(id);
    setQuery("");
  }

  return (
    <section
      className="service-workspace"
      id="layanan"
      aria-label="Jelajahi unit usaha KKP ITB"
    >
      <aside className="workspace-sidebar">
        <div className="workspace-brand">
          <span className="small-monogram">K</span>
          <div>
            KKP ITB<small>Portal layanan</small>
          </div>
          <PanelLeft size={15} />
        </div>
        <span className="sidebar-label">UNIT USAHA</span>
        <div className="service-nav" aria-label="Pilih unit usaha">
          {services.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={active === item.id}
              onClick={() => selectService(item.id)}
              className={active === item.id ? "selected" : ""}
            >
              <item.icon size={17} />
              <span>{item.name}</span>
              {active === item.id && <span className="selected-dot" />}
            </button>
          ))}
        </div>
        <a href="#bantuan" className="sidebar-help">
          <CircleHelp size={16} /> Panduan layanan <ArrowUpRight size={13} />
        </a>
        <div className="sidebar-foot">
          <span className="avatar-initials">ITB</span>
          <div>
            Untuk keluarga besar ITB<small>Bandung · Jatinangor</small>
          </div>
        </div>
      </aside>
      <div className="workspace-main">
        <div className="workspace-toolbar">
          <span>
            Unit usaha <span className="breadcrumb-slash">/</span>{" "}
            <strong>{service.name}</strong>
          </span>
          <span className="preview-label">Pratinjau portal</span>
        </div>
        <div className="workspace-content">
          <div className="workspace-heading">
            <div>
              <span className="eyebrow">LAYANAN KKP ITB</span>
              <h2>{service.name}</h2>
            </div>
            <span className="service-icon">
              <Icon size={25} />
            </span>
          </div>
          <p className="workspace-subtitle">{service.subtitle}</p>
          <p className="workspace-description">{service.description}</p>
          <div className="workspace-filters">
            <label className="workspace-search">
              <Search size={16} />
              <input
                aria-label="Cari informasi unit"
                placeholder={
                  active === "waserda"
                    ? "Cari lokasi waserda…"
                    : "Cari kebutuhan…"
                }
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            {active === "waserda" && (
              <label className="location-select">
                <MapPin size={14} />
                <select
                  aria-label="Pilih lokasi waserda"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                >
                  <option>Semua lokasi</option>
                  {services[0].items.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown size={12} />
              </label>
            )}
          </div>
          <div className="workspace-list" aria-live="polite">
            <div className="list-caption">
              <span>{service.label}</span>
              <span>
                {items.length} {active === "waserda" ? "lokasi" : "layanan"}
              </span>
            </div>
            {items.map((item, index) => (
              <div className="unit-row" key={item}>
                <span className="unit-row-icon">
                  {active === "waserda" ? (
                    <Store size={18} />
                  ) : (
                    <Icon size={18} />
                  )}
                </span>
                <div>
                  <strong>{item}</strong>
                  <small>
                    {active === "waserda"
                      ? item === "Asrama Jatinangor"
                        ? "Kampus Jatinangor"
                        : "Kampus Ganesha"
                      : "Informasi melalui pengelola unit"}
                  </small>
                </div>
                <span className="unit-row-label">
                  {active === "waserda" ? "Waserda" : `0${index + 1}`}
                </span>
              </div>
            ))}
            {items.length === 0 && (
              <p className="no-results">
                Tidak ada hasil. Coba kata lain atau pilih semua lokasi.
              </p>
            )}
          </div>
          <div className="workspace-action">
            <div>
              <span className="status-dot" />
              {service.detail}
            </div>
            {active === "waserda" ? (
              <Link href="/products" className="portal-button primary">
                <ShoppingBag size={15} /> Katalog toko <ArrowRight size={15} />
              </Link>
            ) : (
              <a href="#bantuan" className="portal-button secondary">
                Panduan layanan <ArrowRight size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
