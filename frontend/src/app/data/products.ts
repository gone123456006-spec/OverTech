import { getProductOverrides, getCustomProducts } from '../utils/storage';

export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  category: string;
  image: string;
  description: string;
  stock: number;
}

export const products: Product[] = [
  // Tech
  {
    id: 't1',
    name: 'High-Performance Laptop',
    price: 54999,
    rating: 4.8,
    category: 'tech',
    image: '/assets/images/images (3).jpeg',
    description: 'Powerful laptop for all your professional needs. High-speed processor and stunning display.',
    stock: 15
  },
  {
    id: 't2',
    name: 'Wireless Headphones',
    price: 2499,
    rating: 4.5,
    category: 'tech',
    image: '/assets/images/images (4) (1).jpeg',
    description: 'Crystal clear sound with noise cancellation. Long battery life and comfortable fit.',
    stock: 45
  },
  {
    id: 't3',
    name: 'Smart Watch Pro',
    price: 3999,
    rating: 4.7,
    category: 'tech',
    image: '/assets/images/images (5).jpeg',
    description: 'Track your health and stay connected. Elegant design with a vibrant AMOLED display.',
    stock: 30
  },
  {
    id: 't4',
    name: 'Bluetooth Speaker',
    price: 1499,
    rating: 4.4,
    category: 'tech',
    image: '/assets/images/images (6).jpeg',
    description: 'Compact speaker with rich bass. Water-resistant and perfect for outdoor use.',
    stock: 60
  },
  {
    id: 't5',
    name: 'Digital Camera X1',
    price: 28999,
    rating: 4.9,
    category: 'tech',
    image: '/assets/images/images (7).jpeg',
    description: "Capture life's moments in stunning detail. Professional-grade lens and sensors.",
    stock: 10
  },
  {
    id: 't6',
    name: 'Gaming Mouse',
    price: 999,
    rating: 4.6,
    category: 'tech',
    image: '/assets/images/images (8).jpeg',
    description: 'Precision and speed for gaming enthusiasts. Ergonomic design and customizable buttons.',
    stock: 100
  },
  {
    id: 't7',
    name: 'Mechanical Keyboard',
    price: 1999,
    rating: 4.7,
    category: 'tech',
    image: '/assets/images/images (9).jpeg',
    description: 'Tactile typing experience with RGB lighting. Durable keys and heavy-duty build.',
    stock: 40
  },
  {
    id: 't8',
    name: 'HIK VISION CCTV Kit',
    price: 14999,
    rating: 4.8,
    category: 'tech',
    image: '/assets/images/hikvision_cctv_kit.png',
    description: 'Complete 4-camera security system with DVR. Remote monitoring and night vision.',
    stock: 20
  },
  {
    id: 't9',
    name: 'Thermal Billing Printer',
    price: 8999,
    rating: 4.6,
    category: 'tech',
    image: '/assets/images/thermal_billing_printer_card.png',
    description: 'Fast and reliable thermal receipt printer. Perfect for retail and restaurants.',
    stock: 25
  },
  {
    id: 't10',
    name: 'Web Designing Service',
    price: 4999,
    rating: 5.0,
    category: 'tech',
    image: '/assets/images/website_designing_card.png',
    description: 'Professional website design and development. SEO optimized and mobile-friendly.',
    stock: 50
  },

  // Jewellery
  {
    id: 'j1',
    name: 'Gold Necklace',
    price: 8999,
    rating: 4.9,
    category: 'jewellery',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    description: 'Elegant 22K gold necklace with intricate design. Perfect for special occasions.',
    stock: 10
  },
  {
    id: 'j2',
    name: 'Diamond Earrings',
    price: 12999,
    rating: 5.0,
    category: 'jewellery',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
    description: 'Stunning diamond earrings that sparkle beautifully. Premium quality diamonds.',
    stock: 8
  },
  {
    id: 'j3',
    name: 'Silver Bracelet',
    price: 3499,
    rating: 4.7,
    category: 'jewellery',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
    description: 'Stylish silver bracelet with modern design. Hypoallergenic and durable.',
    stock: 15
  },
  {
    id: 'j4',
    name: 'Pearl Ring',
    price: 5999,
    rating: 4.8,
    category: 'jewellery',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
    description: 'Beautiful pearl ring with gold band. Timeless elegance for any outfit.',
    stock: 12
  },
  {
    id: 'j5',
    name: 'Gold Bangles Set',
    price: 15999,
    rating: 4.9,
    category: 'jewellery',
    image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=400',
    description: 'Set of 4 gold bangles with traditional design. Perfect for weddings and festivals.',
    stock: 6
  },
  {
    id: 'j6',
    name: 'Gemstone Pendant',
    price: 7499,
    rating: 4.6,
    category: 'jewellery',
    image: 'https://images.unsplash.com/photo-1506630448388-4e663ecca085?w=400',
    description: 'Exquisite gemstone pendant with silver chain. Natural gemstones with vibrant colors.',
    stock: 10
  },

  // Food
  {
    id: 'f1',
    name: 'Organic Almonds',
    price: 699,
    rating: 4.5,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400',
    description: 'Premium quality organic almonds. Rich in protein and healthy fats. 500g pack.',
    stock: 100
  },
  {
    id: 'f2',
    name: 'Honey Jar',
    price: 399,
    rating: 4.7,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784670?w=400',
    description: 'Pure natural honey from bee farms. No artificial additives. 500ml jar.',
    stock: 75
  },
  {
    id: 'f3',
    name: 'Olive Oil',
    price: 899,
    rating: 4.8,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    description: 'Extra virgin olive oil. Cold pressed and perfect for cooking and salads. 1L bottle.',
    stock: 60
  },
  {
    id: 'f4',
    name: 'Dark Chocolate',
    price: 299,
    rating: 4.6,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400',
    description: 'Premium dark chocolate with 70% cocoa. Rich and intense flavor. 200g bar.',
    stock: 120
  },
  {
    id: 'f5',
    name: 'Green Tea',
    price: 449,
    rating: 4.4,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
    description: 'Organic green tea leaves. Antioxidant-rich and refreshing. 250g pack.',
    stock: 90
  },
  {
    id: 'f6',
    name: 'Quinoa Pack',
    price: 599,
    rating: 4.7,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    description: 'Organic quinoa - superfood rich in protein and fiber. 1kg pack.',
    stock: 50
  },
  {
    id: 'f7',
    name: 'Cream Biscuits Pack',
    price: 100,
    rating: 4.4,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    description: 'Crispy cream-filled biscuits. Perfect with tea or as a quick snack. 200g pack.',
    stock: 120
  },
  {
    id: 'f8',
    name: 'Milk Chocolate Bar',
    price: 50,
    rating: 4.5,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400',
    description: 'Smooth milk chocolate. Rich and creamy taste. 50g bar.',
    stock: 150
  },
  {
    id: 'f9',
    name: 'Assorted Cookies Tin',
    price: 199,
    rating: 4.6,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
    description: 'Assorted butter cookies and biscuits. Great for gifting or snacking. 400g tin.',
    stock: 80
  },
  {
    id: 'f10',
    name: 'Chocolate Cookies',
    price: 35,
    rating: 4.2,
    category: 'food',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400',
    description: 'Chocolate-flavored cookies. Crunchy and delicious. 100g pack.',
    stock: 200
  }
];

function applyOverride(product: Product, overrides: ReturnType<typeof getProductOverrides>): Product {
  const ov = overrides.find((o) => o.id === product.id);
  return ov ? { ...product, ...ov } : product;
}

export const getProductById = (id: string): Product | undefined => {
  const overrides = getProductOverrides();
  const base = products.find((p) => p.id === id);
  if (base) return applyOverride(base, overrides);

  const custom = getCustomProducts().find((p) => p.id === id);
  return custom ? applyOverride(custom, overrides) : undefined;
};

export const getAllProducts = (): Product[] => {
  const overrides = getProductOverrides();
  return [
    ...products.map((p) => applyOverride(p, overrides)),
    ...getCustomProducts().map((p) => applyOverride(p, overrides)),
  ];
};

export const getProductsByCategory = (category: string): Product[] => {
  return getAllProducts().filter((p) => p.category === category);
};

function nameMatchScore(name: string, term: string): number {
  const lowerName = name.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const words = lowerName.split(/[\s/-]+/).filter(Boolean);

  if (lowerName === lowerTerm) return 100;
  if (lowerName.startsWith(lowerTerm)) return 95;
  if (words.some((word) => word === lowerTerm)) return 90;
  if (words.some((word) => word.startsWith(lowerTerm))) return 85;
  if (lowerName.includes(lowerTerm)) return 75;
  return 0;
}

function categoryMatchScore(category: string, term: string): number {
  const lowerCategory = category.toLowerCase();
  const lowerTerm = term.toLowerCase();
  if (lowerCategory === lowerTerm) return 60;
  if (lowerCategory.startsWith(lowerTerm)) return 55;
  if (lowerCategory.includes(lowerTerm)) return 50;
  return 0;
}

function descriptionMatchScore(description: string, term: string): number {
  const lowerTerm = term.toLowerCase();
  const words = description
    .toLowerCase()
    .split(/[\s,./()-]+/)
    .filter(Boolean);

  if (words.some((word) => word === lowerTerm)) return 30;
  return 0;
}

function scoreProduct(product: Product, terms: string[]): number {
  let total = 0;

  for (const term of terms) {
    const nameScore = nameMatchScore(product.name, term);
    const categoryScore = categoryMatchScore(product.category, term);
    const descriptionScore = descriptionMatchScore(product.description, term);
    const termScore = Math.max(nameScore, categoryScore, descriptionScore);

    if (termScore === 0) return 0;
    total += termScore;
  }

  return total;
}

export const searchProducts = (query: string): Product[] => {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return getAllProducts()
    .map((product) => ({ product, score: scoreProduct(product, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .map(({ product }) => product);
};

export const isCustomProduct = (id: string): boolean => {
  return getCustomProducts().some((p) => p.id === id);
};
