export interface RoomCategory {
  id: string;
  name: string;
  nameMr: string;
  tagline: string;
  pricePerNight: number;
  totalRooms: number;
  maxAdults: number;
  maxChildren: number;
  bedType: string;
  sizeSqFt: number;
  image: string;
  description: string;
  descriptionMr: string;
  amenities: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isJainAvailable: boolean;
  isChefSpecial?: boolean;
  description?: string;
}

export const HOTEL_INFO = {
  name: "Hotel Edesiea",
  legalName: "Hotel Edesiea & Edelisa Authenticity Restaurant",
  tagline: "Authentic Flavors · Timeless Hospitality",
  taglineMr: "अस्सल चव · अविस्मरणीय आतिथ्य",
  address: "Shree Ballaleshwar Devshthan Temple Road, Pali, Maharashtra 410205, India",
  landmark: "Moments from Shree Ballaleshwar Ganpati Temple (Ashtavinayak)",
  landmarkMr: "श्री बल्लाळेश्वर गणपती मंदिराच्या अगदी जवळ (अष्टविनायक)",
  phone: "+91 8855887673",
  whatsapp: "918855887673",
  whatsappDisplay: "+91 8855887673",
  secondaryPhone: "+91 7079799111",
  emails: ["edesieaoffice@gmail.com", "taukeerakbar.code@mail.com"],
  mapsUrl: "https://maps.app.goo.gl/ZKSFVCUsSZ62sFuu8",
  businessHours: "10:00 AM – 12:00 AM (Midnight) / 24/7 Front Desk Reception",
  restaurantHours: "Breakfast: 7:30 AM – 12:00 PM | Lunch & Dinner: 11:30 AM – 11:00 PM",
  currency: "INR",
  currencySymbol: "₹",
  checkInTime: "12:00 PM (Noon)",
  checkOutTime: "11:00 AM",
  advanceRequired: 500,
  restaurantGstRate: 5.0, // 2.5% CGST + 2.5% SGST
  cancellationPolicyNotice: "Cancellations permitted up to 2 days (48 hours) prior to check-in via WhatsApp. Strictly non-refundable within 48 hours of booking.",
};

export const ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: "deluxe",
    name: "Deluxe Room",
    nameMr: "डिलक्स रूम",
    tagline: "Serene, well-appointed comfort for solo travellers and couples",
    pricePerNight: 3000,
    totalRooms: 3,
    maxAdults: 3,
    maxChildren: 1,
    bedType: "King-Size Bed",
    sizeSqFt: 240,
    image: "/images/room-real.png",
    description: "A serene, well-appointed room ideal for solo travellers, couples, and temple pilgrims seeking comfort and quiet elegance.",
    descriptionMr: "एक शांत आणि सुसज्ज खोली, जी भाविक, सोलो प्रवासी आणि जोडप्यांसाठी अत्यंत सोयीस्कर आहे.",
    amenities: ["King-size bed", "Air conditioning", "Free high-speed Wi-Fi", "Premium custom linen", "Hot water (24/7)", "Electric kettle & tea kit", "Modern en-suite bathroom"]
  },
  {
    id: "honeymoon",
    name: "Honeymoon Suite",
    nameMr: "हनीमून स्वीट",
    tagline: "Romantic ambient lighting, refined comforts and scenic hill views",
    pricePerNight: 3500,
    totalRooms: 3,
    maxAdults: 2,
    maxChildren: 1,
    bedType: "King-Size Bed",
    sizeSqFt: 280,
    image: "/images/room-real.png",
    description: "A romantic retreat designed with warm ambient illumination, plush bedding, and curated hospitality touches.",
    descriptionMr: "विशेष जोडप्यांसाठी डिझाइन केलेले मनमोहक वातावरण, उत्कृष्ट आराम आणि सर्वोत्तम सोयी.",
    amenities: ["King-size luxury bed", "Ambient mood lighting", "Air conditioning", "High-speed Wi-Fi", "En-suite bathroom with luxury toiletries", "Tea & coffee maker", "Room service priority"]
  },
  {
    id: "super-deluxe",
    name: "Super Deluxe Room",
    nameMr: "सुपर डिलक्स रूम",
    tagline: "Best rates when you book direct • Refined, light-filled interiors",
    pricePerNight: 4000,
    totalRooms: 3,
    maxAdults: 3,
    maxChildren: 2,
    bedType: "King-Size Bed + Lounge Seating",
    sizeSqFt: 320,
    image: "/images/room-real.png",
    description: "Refined, light-filled interiors with thoughtful modern touches, spacious lounge seating, and work desk.",
    descriptionMr: "विशाल आणि प्रकाशमान अंतर्गत रचना, आरामदायी सोफा, टीव्ही आणि संपूर्ण वातानुकूलन.",
    amenities: ["King-size plush bed", "Lounge sofa seating", "Air conditioning", "High-speed Wi-Fi", "Smart HD TV", "Electric kettle & refreshments", "Premium toiletries", "Daily housekeeping"]
  },
  {
    id: "suite",
    name: "Suite Room",
    nameMr: "रॉयल स्वीट रूम",
    tagline: "Expansive luxury suite with separate sitting hall and balcony",
    pricePerNight: 6500,
    totalRooms: 3,
    maxAdults: 4,
    maxChildren: 2,
    bedType: "Master King Bed + Daybed",
    sizeSqFt: 450,
    image: "/images/room-real.png",
    description: "The pinnacle of comfort at Hotel Edesiea, featuring a separate private living lounge, scenic views, and personalized service.",
    descriptionMr: "हॉटेल एडेसियामधील सर्वात आलिशान स्वीट, स्वतंत्र दिवाणखाना आणि कुटुंबियांसमवेत राहण्यासाठी उत्तम जागा.",
    amenities: ["Master bedroom with King bed", "Separate private living hall", "Smart LED TV", "High-speed Wi-Fi", "Air conditioning throughout", "Mini-fridge & tea bar", "Luxury bath amenities", "Complimentary temple assistance"]
  }
];

export const MENU_CATEGORIES = [
  "South Indian Special",
  "Idli & Vada",
  "Uttapam",
  "Maharashtrian Snacks",
  "Paratha & Pav Bhaji",
  "Maharashtrian Soups & Starters",
  "Maharashtrian Main Course",
  "Edesiea Thali Menu",
  "Tandoor & Tikka",
  "Indian Curries & Dal",
  "Roti & Breads",
  "Rice & Biryani",
  "Pastas & Oriental",
  "10-inch Gourmet Pizzas",
  "Jain Special Menu"
] as const;

export const MENU_ITEMS: MenuItem[] = [
  // South Indian
  { id: "si-1", name: "Ghee Sadha Dosa", category: "South Indian Special", price: 99, isJainAvailable: true },
  { id: "si-2", name: "Ghee Masala Dosa", category: "South Indian Special", price: 100, isJainAvailable: false },
  { id: "si-3", name: "Ghee Mysore Masala Dosa", category: "South Indian Special", price: 130, isJainAvailable: false },
  { id: "si-4", name: "Ghee Mysore Cheese Dosa", category: "South Indian Special", price: 150, isJainAvailable: false },
  { id: "si-5", name: "Ghee Cut Dosa", category: "South Indian Special", price: 120, isJainAvailable: false },
  { id: "si-6", name: "Ghee Set Dosa", category: "South Indian Special", price: 120, isJainAvailable: false },
  { id: "si-7", name: "Ghee Cheese Masala Dosa", category: "South Indian Special", price: 140, isJainAvailable: false },
  { id: "si-8", name: "Ghee Podi Masala Dosa", category: "South Indian Special", price: 140, isJainAvailable: true, isChefSpecial: true },
  { id: "si-9", name: "Ghee Paper Masala Dosa", category: "South Indian Special", price: 180, isJainAvailable: false },
  { id: "si-10", name: "Peri Peri Masala Dosa", category: "South Indian Special", price: 120, isJainAvailable: false },
  { id: "si-11", name: "Benne Dosa", category: "South Indian Special", price: 160, isJainAvailable: true, isChefSpecial: true },

  // Idli & Vada
  { id: "iv-1", name: "Idli Sambar", category: "Idli & Vada", price: 80, isJainAvailable: true },
  { id: "iv-2", name: "Mini Idli", category: "Idli & Vada", price: 80, isJainAvailable: true },
  { id: "iv-3", name: "Ghee Thatte Idli", category: "Idli & Vada", price: 99, isJainAvailable: true, isChefSpecial: true },
  { id: "iv-4", name: "Kanchipuram Idli", category: "Idli & Vada", price: 100, isJainAvailable: true },
  { id: "iv-5", name: "Idli Sandwich", category: "Idli & Vada", price: 100, isJainAvailable: false },
  { id: "iv-6", name: "Idli Fry", category: "Idli & Vada", price: 90, isJainAvailable: true },
  { id: "iv-7", name: "Medu Vada Sambar", category: "Idli & Vada", price: 90, isJainAvailable: true },
  { id: "iv-8", name: "Batata Vada Sambar", category: "Idli & Vada", price: 90, isJainAvailable: false },
  { id: "iv-9", name: "Dahi Vada", category: "Idli & Vada", price: 120, isJainAvailable: true },

  // Uttapam
  { id: "ut-1", name: "Ghee Onion Uttapam", category: "Uttapam", price: 100, isJainAvailable: false },
  { id: "ut-2", name: "Ghee Masala Uttapam", category: "Uttapam", price: 110, isJainAvailable: false },
  { id: "ut-3", name: "Ghee Peri Peri Uttapam", category: "Uttapam", price: 130, isJainAvailable: false },
  { id: "ut-4", name: "Ghee Cheese Uttapam", category: "Uttapam", price: 140, isJainAvailable: true },
  { id: "ut-5", name: "Onion Tomato Uttapam", category: "Uttapam", price: 110, isJainAvailable: false },
  { id: "ut-6", name: "Ghee Podi Uttapam", category: "Uttapam", price: 140, isJainAvailable: true, isChefSpecial: true },

  // Maharashtrian Snacks
  { id: "mh-1", name: "Pohe", category: "Maharashtrian Snacks", price: 60, isJainAvailable: false },
  { id: "mh-2", name: "Upma", category: "Maharashtrian Snacks", price: 60, isJainAvailable: true },
  { id: "mh-3", name: "Shera (Prasad Style)", category: "Maharashtrian Snacks", price: 80, isJainAvailable: true, isChefSpecial: true },
  { id: "mh-4", name: "Sabudana Khichdi", category: "Maharashtrian Snacks", price: 90, isJainAvailable: true },
  { id: "mh-5", name: "Sabudana Vada", category: "Maharashtrian Snacks", price: 110, isJainAvailable: true },
  { id: "mh-6", name: "Puri Bhaji", category: "Maharashtrian Snacks", price: 110, isJainAvailable: false },
  { id: "mh-7", name: "Thalipeeth with Loni & Thecha", category: "Maharashtrian Snacks", price: 110, isJainAvailable: false, isChefSpecial: true },
  { id: "mh-8", name: "Special Misal Pav", category: "Maharashtrian Snacks", price: 99, isJainAvailable: false, isChefSpecial: true },
  { id: "mh-9", name: "Kanda Bhaji", category: "Maharashtrian Snacks", price: 80, isJainAvailable: false },

  // Pav Bhaji
  { id: "pb-1", name: "Amul Special Pav Bhaji", category: "Paratha & Pav Bhaji", price: 130, isJainAvailable: true },
  { id: "pb-2", name: "Cheese Pav Bhaji", category: "Paratha & Pav Bhaji", price: 160, isJainAvailable: true },
  { id: "pb-3", name: "Khada Pav Bhaji", category: "Paratha & Pav Bhaji", price: 160, isJainAvailable: false },
  { id: "pb-4", name: "Paneer Pav Bhaji", category: "Paratha & Pav Bhaji", price: 170, isJainAvailable: true },
  { id: "pb-5", name: "Edesiea Special Pav Bhaji", category: "Paratha & Pav Bhaji", price: 180, isJainAvailable: false, isChefSpecial: true },
  { id: "pb-6", name: "Butter Paneer Paratha", category: "Paratha & Pav Bhaji", price: 150, isJainAvailable: true },

  // Maharashtrian Soups & Starters
  { id: "ms-1", name: "Matki Soup", category: "Maharashtrian Soups & Starters", price: 149, isJainAvailable: false },
  { id: "ms-2", name: "Methi Thecha Soup", category: "Maharashtrian Soups & Starters", price: 159, isJainAvailable: false, isChefSpecial: true },
  { id: "ms-3", name: "Kokum Soup", category: "Maharashtrian Soups & Starters", price: 179, isJainAvailable: true },
  { id: "ms-4", name: "Shevga Soup (Drumstick)", category: "Maharashtrian Soups & Starters", price: 179, isJainAvailable: true },
  { id: "ms-5", name: "Alu Vadi", category: "Maharashtrian Soups & Starters", price: 209, isJainAvailable: true },
  { id: "ms-6", name: "Kothimbir Vadi", category: "Maharashtrian Soups & Starters", price: 209, isJainAvailable: true },
  { id: "ms-7", name: "Mass Vadi", category: "Maharashtrian Soups & Starters", price: 219, isJainAvailable: false, isChefSpecial: true },

  // Maharashtrian Main Course
  { id: "mm-1", name: "Bharli Vangi", category: "Maharashtrian Main Course", price: 229, isJainAvailable: false },
  { id: "mm-2", name: "Shev Bhaji", category: "Maharashtrian Main Course", price: 209, isJainAvailable: false },
  { id: "mm-3", name: "Zunka with Bhakri", category: "Maharashtrian Main Course", price: 209, isJainAvailable: false, isChefSpecial: true },
  { id: "mm-4", name: "Pithla", category: "Maharashtrian Main Course", price: 209, isJainAvailable: false },
  { id: "mm-5", name: "Matki Usal", category: "Maharashtrian Main Course", price: 229, isJainAvailable: false },
  { id: "mm-6", name: "Sandgyachi Bhaji", category: "Maharashtrian Main Course", price: 249, isJainAvailable: false },
  { id: "mm-7", name: "Shingolychi Bhaji", category: "Maharashtrian Main Course", price: 249, isJainAvailable: false },
  { id: "mm-8", name: "Mass Vadi Rassa", category: "Maharashtrian Main Course", price: 269, isJainAvailable: false, isChefSpecial: true },
  { id: "mm-9", name: "Kokani Style Kachya Fansachi Bhaji", category: "Maharashtrian Main Course", price: 249, isJainAvailable: false, isChefSpecial: true },

  // Thali
  { id: "th-1", name: "Punjabi Thali", category: "Edesiea Thali Menu", price: 200, isJainAvailable: true, description: "Paneer subji, veg subji, dal tadka, jeera rice, 3 rotis, salad, sweet & pickle" },
  { id: "th-2", name: "Maharashtrian Thali", category: "Edesiea Thali Menu", price: 349, isJainAvailable: false, isChefSpecial: true, description: "Mass vadi rassa, shingolychi bhaji, shevga fry, varan bhaat, jowar bhakri/chapati, papad, laapsi, mattha & thecha" },
  { id: "th-3", name: "Special Chaturthi Thali", category: "Edesiea Thali Menu", price: 449, isJainAvailable: true, isChefSpecial: true, description: "Ukadiche Modak / Puran Poli with Sajuk Tup, Phulka, Amti, Masala Bhaat, Malabar curry, Sol Kadhi & more" },

  // Tandoor
  { id: "td-1", name: "Amritsari Paneer Tikka", category: "Tandoor & Tikka", price: 259, isJainAvailable: true },
  { id: "td-2", name: "Malai Paneer Tikka", category: "Tandoor & Tikka", price: 269, isJainAvailable: true },
  { id: "td-3", name: "Smoked Paneer Pahadi Tikka", category: "Tandoor & Tikka", price: 269, isJainAvailable: false },
  { id: "td-4", name: "Tandoori Broccoli", category: "Tandoor & Tikka", price: 249, isJainAvailable: true, isChefSpecial: true },
  { id: "td-5", name: "Veg Platter (24 pcs 6 Tikkas)", category: "Tandoor & Tikka", price: 799, isJainAvailable: false, isChefSpecial: true },

  // Curries
  { id: "cr-1", name: "Paneer Ghee Roast", category: "Indian Curries & Dal", price: 309, isJainAvailable: true, isChefSpecial: true },
  { id: "cr-2", name: "Malabar Veg Curry", category: "Indian Curries & Dal", price: 309, isJainAvailable: true },
  { id: "cr-3", name: "Paneer Tikka Masala", category: "Indian Curries & Dal", price: 289, isJainAvailable: false },
  { id: "cr-4", name: "Kaju Paneer Lababdar", category: "Indian Curries & Dal", price: 299, isJainAvailable: true },
  { id: "cr-5", name: "Dal Makhani", category: "Indian Curries & Dal", price: 229, isJainAvailable: true },
  { id: "cr-6", name: "Dal Tadka", category: "Indian Curries & Dal", price: 179, isJainAvailable: true },

  // Breads
  { id: "br-1", name: "Butter Cheese Naan", category: "Roti & Breads", price: 130, isJainAvailable: true },
  { id: "br-2", name: "Garlic Butter Naan", category: "Roti & Breads", price: 100, isJainAvailable: false },
  { id: "br-3", name: "Butter Chapati", category: "Roti & Breads", price: 35, isJainAvailable: true },
  { id: "br-4", name: "Jwar / Bajri Bhakri", category: "Roti & Breads", price: 60, isJainAvailable: true },

  // Pizzas & Pastas
  { id: "pz-1", name: "Margherita 10-inch Pizza", category: "10-inch Gourmet Pizzas", price: 299, isJainAvailable: true },
  { id: "pz-2", name: "Paneer Tikka Pizza", category: "10-inch Gourmet Pizzas", price: 329, isJainAvailable: false },
  { id: "pz-3", name: "The Green Garden Pesto Pizza", category: "10-inch Gourmet Pizzas", price: 409, isJainAvailable: true, isChefSpecial: true },
  { id: "ps-1", name: "Classic Alfredo Pasta", category: "Pastas & Oriental", price: 309, isJainAvailable: true },
  { id: "ps-2", name: "Penne Arrabbiata", category: "Pastas & Oriental", price: 279, isJainAvailable: false }
];
