export function generateProductSchema(
  product: any,
  siteUrl: string,
  brandName?: string,
  currency: string = "INR",
) {
  const images = (() => {
    try {
      const arr = JSON.parse(product.images || "[]");
      return Array.isArray(arr)
        ? arr.map((img) => (img.startsWith("http") ? img : `${siteUrl}${img}`))
        : [];
    } catch {
      return [];
    }
  })();

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || product.description,
    sku: product.sku,
    image: images,
    brand: {
      "@type": "Brand",
      name: brandName || "Store",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: currency,
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  // Add custom schema overrides if present
  if (product.customSchema && product.customSchema !== "{}") {
    try {
      const overrides = JSON.parse(product.customSchema);
      return { ...schema, ...overrides };
    } catch (e) {
      console.error("Failed to parse custom schema", e);
    }
  }

  return schema;
}

export function generateArticleSchema(
  post: any,
  siteUrl: string,
  brandName?: string,
) {
  const name = brandName;
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage.startsWith("http")
      ? post.coverImage
      : `${siteUrl}${post.coverImage}`,
    author: {
      "@type": "Organization",
      name,
    },
    publisher: {
      "@type": "Organization",
      name,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    datePublished: post.publishedAt || post.createdAt,
  };

  if (post.customSchema && post.customSchema !== "{}") {
    try {
      const overrides = JSON.parse(post.customSchema);
      return { ...schema, ...overrides };
    } catch (e) {
      console.warn("Failed to parse blog post custom schema:", e);
    }
  }

  return schema;
}
