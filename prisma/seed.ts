import { PrismaClient, UserRole, UserType, ProductCategory, ProductStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()

  // 1. Seed Users
  // Note: These users represent OAuth users that have completed their profile.
  // We do not store passwords because authentication is handled via Google OAuth.
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@km-itb.ac.id",
      name: "Admin KM ITB",
      role: UserRole.SUPERADMIN,
      userType: UserType.MAHASISWA,
      profileCompleted: true,
      waNumber: "081234567890",
      addresses: {
        create: {
          street: "Sekretariat KM ITB, Gedung Sunken Court",
          district: "Coblong",
          city: "Kota Bandung",
          province: "Jawa Barat",
          postalCode: "40132",
          isDefault: true,
        },
      },
    },
  })

  const buyerUser = await prisma.user.create({
    data: {
      email: "mahasiswa@std.itb.ac.id",
      name: "Mahasiswa ITB",
      role: UserRole.BUYER,
      userType: UserType.MAHASISWA,
      profileCompleted: true,
      waNumber: "089876543210",
      addresses: {
        create: {
          street: "Asrama ITB Kidang Pananjung",
          district: "Coblong",
          city: "Kota Bandung",
          province: "Jawa Barat",
          postalCode: "40132",
          isDefault: true,
        },
      },
    },
  })

  // 2. Seed Products
  const products = [
    {
      name: "Jaket KM ITB Edisi Klasik",
      slug: "jaket-km-itb-klasik",
      description: "Jaket resmi Keluarga Mahasiswa ITB dengan desain klasik dan material berkualitas tinggi.",
      material: "Taslan & Cotton Fleece",
      category: ProductCategory.KM_ITB,
      price: 250000,
      image: "/images/product-1.jpg",
    },
    {
      name: "Kaos Ganesha Biru",
      slug: "kaos-ganesha-biru",
      description: "Kaos katun premium dengan siluet Ganesha. Nyaman untuk digunakan sehari-hari.",
      material: "Cotton Combed 30s",
      category: ProductCategory.OFFICIAL_ITB,
      price: 100000,
      image: "/images/product-2.jpg",
    },
    {
      name: "Hoodie KM ITB Navy",
      slug: "hoodie-km-itb-navy",
      description: "Hoodie tebal berwarna navy dengan bordir logo KM ITB.",
      material: "Fleece Tebal",
      category: ProductCategory.KM_ITB,
      price: 200000,
      image: "/images/product-3.jpg",
    },
    {
      name: "Tumblr Ganesha ITB",
      slug: "tumblr-ganesha-itb",
      description: "Botol minum stainless steel tahan panas/dingin hingga 12 jam.",
      material: "Stainless Steel 304",
      category: ProductCategory.OFFICIAL_ITB,
      price: 150000,
      image: "/images/product-4.jpg",
    },
    {
      name: "Lanyard Eksklusif KM ITB",
      slug: "lanyard-eksklusif-km-itb",
      description: "Tali id card dengan bahan tebal dan desain elegan.",
      material: "Polyester",
      category: ProductCategory.KM_ITB,
      price: 35000,
      image: "/images/product-5.jpg",
    },
    {
      name: "Tote Bag Kanvas ITB",
      slug: "tote-bag-kanvas-itb",
      description: "Tote bag kuat dan fungsional untuk membawa buku dan laptop.",
      material: "Kanvas Premium",
      category: ProductCategory.OFFICIAL_ITB,
      price: 75000,
      image: "/images/product-6.jpg",
    },
    {
      name: "Topi Baseball KM ITB",
      slug: "topi-baseball-km-itb",
      description: "Topi baseball dengan bordir logo KM ITB, cocok untuk aktivitas luar ruangan.",
      material: "Twill Cotton",
      category: ProductCategory.KM_ITB,
      price: 60000,
      image: "/images/product-7.jpg",
    },
    {
      name: "Sticker Pack ITB & Ganesha",
      slug: "sticker-pack-itb-ganesha",
      description: "Kumpulan stiker vinyl tahan air dengan berbagai desain ikonik ITB.",
      material: "Vinyl Waterproof",
      category: ProductCategory.EVENT_POPUP,
      price: 25000,
      image: "/images/product-8.jpg",
    },
  ]

  for (const [index, p] of products.entries()) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        material: p.material,
        status: ProductStatus.PUBLISHED,
        category: p.category,
        images: {
          create: {
            url: p.image,
            isPrimary: true,
          }
        },
        variants: {
          create: [
            {
              name: "S",
              sku: `SKU-${index + 1}-S`,
              price: p.price,
              stock: 10,
            },
            {
              name: "M",
              sku: `SKU-${index + 1}-M`,
              price: p.price,
              stock: 20,
            },
            {
              name: "L",
              sku: `SKU-${index + 1}-L`,
              price: p.price,
              stock: 15,
            }
          ]
        }
      }
    })
  }

  // 3. Seed Sample Orders for buyerUser
  const sampleProduct = await prisma.productVariant.findFirst()
  if (sampleProduct) {
    await prisma.order.create({
      data: {
        orderNumber: "ORD-TEST-001",
        userId: buyerUser.id,
        status: "COMPLETED",
        subtotal: sampleProduct.price,
        buyerFee: 5000,
        deliveryFee: 15000,
        total: Number(sampleProduct.price) + 20000,
        deliveryMethod: "DELIVERY",
        shippingName: buyerUser.name,
        shippingPhone: buyerUser.waNumber,
        shippingStreet: "Asrama ITB Kidang Pananjung",
        shippingCity: "Bandung",
        items: {
          create: {
            variantId: sampleProduct.id,
            quantity: 1,
            price: sampleProduct.price,
          }
        }
      }
    })
  }

  console.log("Database has been seeded!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
