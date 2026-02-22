import { getProductOverrides } from '../utils/storage';

export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  category: 'clothes' | 'jewellery' | 'food';
  image: string;
  description: string;
  stock: number;
}

export const products: Product[] = [
  // Clothes
  {
    id: 'c1',
    name: 'Cotton T-Shirt',
    price: 499,
    rating: 4.5,
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    description: 'Comfortable cotton t-shirt perfect for everyday wear. Made from 100% organic cotton.',
    stock: 50
  },
  {
    id: 'c2',
    name: 'Denim Jeans',
    price: 1299,
    rating: 4.7,
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    description: 'Classic denim jeans with a modern fit. Durable and stylish for any occasion.',
    stock: 35
  },
  {
    id: 'c3',
    name: 'Casual Shirt',
    price: 899,
    rating: 4.3,
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    description: 'Versatile casual shirt suitable for office and casual outings.',
    stock: 40
  },
  {
    id: 'c4',
    name: 'Summer Dress',
    price: 1599,
    rating: 4.8,
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    description: 'Elegant summer dress with beautiful floral patterns. Light and breezy fabric.',
    stock: 25
  },
  {
    id: 'c5',
    name: 'Hooded Jacket',
    price: 2199,
    rating: 4.6,
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    description: 'Warm hooded jacket for cold weather. Water-resistant and windproof.',
    stock: 30
  },
  {
    id: 'c6',
    name: 'Formal Blazer',
    price: 2999,
    rating: 4.9,
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
    description: 'Professional blazer perfect for business meetings and formal events.',
    stock: 20
  },
  {
    id: 'c7',
    name: 'Cotton Socks Pack',
    price: 100,
    rating: 4.3,
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1586354782930-d6921b63a881?w=400',
    description: 'Comfortable pack of 3 cotton socks. Soft, breathable and durable for daily wear.',
    stock: 80
  },
  {
    id: 'c8',
    name: 'Cotton Cap',
    price: 50,
    rating: 4.2,
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
    description: 'Lightweight cotton cap. Perfect for casual wear and sun protection.',
    stock: 150
  },
  {
    id: 'c9',
    name: 'Fashion Scarf',
    price: 199,
    rating: 4.5,
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400',
    description: 'Lightweight printed scarf. Perfect accessory for outfits or as a head wrap.',
    stock: 60
  },
  {
    id: 'c10',
    name: 'Cotton Handkerchief',
    price: 35,
    rating: 4.0,
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400',
    description: 'Soft cotton handkerchief. Multipurpose - use as pocket square or daily wipe.',
    stock: 200
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

export const getProductById = (id: string): Product | undefined => {
  const base = products.find(p => p.id === id);
  if (!base) return undefined;
  const overrides = getProductOverrides();
  const ov = overrides.find(o => o.id === id);
  return ov ? { ...base, ...ov } : base;
};

export const getAllProducts = (): Product[] => {
  const overrides = getProductOverrides();
  return products.map(p => {
    const ov = overrides.find(o => o.id === p.id);
    return ov ? { ...p, ...ov } : p;
  });
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(p => p.category === category);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  );
};
