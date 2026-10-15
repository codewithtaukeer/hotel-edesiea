import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "edesiea_salt_2026").digest("hex");
}

async function main() {
  console.log("🌱 Starting Hotel Edesiea Database Seeding...");

  // 1. Hotel Settings
  await prisma.hotelSettings.upsert({
    where: { id: "edesiea_settings" },
    update: {},
    create: {
      id: "edesiea_settings",
      hotelName: "Hotel Edesiea",
      legalName: "Hotel Edesiea & Edelisa Authenticity Restaurant",
      tagline: "Authentic Flavors · Timeless Hospitality",
      taglineMr: "अस्सल चव · अविस्मरणीय आतिथ्य",
      address: "Shree Ballaleshwar Devshthan Temple Road, Pali, Maharashtra 410205, India",
      pinCode: "410205",
      landmark: "Near Shree Ballaleshwar Ganpati Temple (Ashtavinayak)",
      phone: "+91 8855887673",
      whatsapp: "918855887673",
      emailPrimary: "edesieaoffice@gmail.com",
      emailSecondary: "taukeerakbar.code@mail.com",
      mapsUrl: "https://maps.app.goo.gl/ZKSFVCUsSZ62sFuu8",
      currency: "INR",
      currencySymbol: "₹",
      timezone: "Asia/Kolkata",
      checkInTime: "12:00 PM",
      checkOutTime: "11:00 AM",
      advanceDepositAmount: 500.0,
      cancellationHoursLimit: 48,
      restaurantGstRate: 5.0, // 2.5% CGST + 2.5% SGST as per receipt EAR_649
      roomGstRate: 12.0,
      gstin: "",
      isBookingOpen: true,
    },
  });
  console.log("✓ Hotel Business Configuration seeded");

  // 2. Room Categories & 12 Physical Rooms
  const categories = [
    {
      id: "deluxe",
      name: "Deluxe Room",
      nameMr: "डिलक्स रूम",
      tagline: "Serene, well-appointed comfort for solo travellers and couples",
      basePrice: 3000,
      totalRooms: 3,
      maxAdults: 3,
      maxChildren: 1,
      bedType: "King-size bed",
      sizeSqFt: 240,
      description: "A serene, well-appointed room ideal for solo travellers, couples, and temple pilgrims.",
      descriptionMr: "एक शांत आणि सुसज्ज खोली, जी भाविक, सोलो प्रवासी आणि जोडप्यांसाठी अत्यंत सोयीस्कर आहे.",
      amenities: ["King-size bed", "Air conditioning", "Free high-speed Wi-Fi", "Custom embroidered linen", "24/7 Hot water", "Electric kettle"],
      rooms: ["101", "102", "103"],
      floor: 1,
    },
    {
      id: "honeymoon",
      name: "Honeymoon Suite",
      nameMr: "हनीमून स्वीट",
      tagline: "Romantic ambient lighting, refined comforts and scenic hill views",
      basePrice: 3500,
      totalRooms: 3,
      maxAdults: 2,
      maxChildren: 1,
      bedType: "King-size bed",
      sizeSqFt: 280,
      description: "A romantic retreat designed with warm ambient illumination and luxury amenities.",
      descriptionMr: "विशेष जोडप्यांसाठी डिझाइन केलेले मनमोहक वातावरण आणि सर्वोत्तम सोयी.",
      amenities: ["King-size luxury bed", "Ambient mood lighting", "Air conditioning", "High-speed Wi-Fi", "Tea & coffee maker", "Priority room service"],
      rooms: ["201", "202", "203"],
      floor: 2,
    },
    {
      id: "super-deluxe",
      name: "Super Deluxe Room",
      nameMr: "सुपर डिलक्स रूम",
      tagline: "Best rates when you book direct • Refined, light-filled interiors",
      basePrice: 4000,
      totalRooms: 3,
      maxAdults: 3,
      maxChildren: 2,
      bedType: "King-size bed + Lounge seating",
      sizeSqFt: 320,
      description: "Refined, light-filled interiors with thoughtful modern touches and lounge seating.",
      descriptionMr: "विशाल आणि प्रकाशमान अंतर्गत रचना, आरामदायी सोफा, टीव्ही आणि संपूर्ण वातानुकूलन.",
      amenities: ["King-size plush bed", "Lounge sofa seating", "Air conditioning", "High-speed Wi-Fi", "Smart HD TV", "Electric kettle"],
      rooms: ["301", "302", "303"],
      floor: 3,
    },
    {
      id: "suite",
      name: "Suite Room",
      nameMr: "रॉयल स्वीट रूम",
      tagline: "Expansive luxury suite with separate sitting hall and balcony",
      basePrice: 6500,
      totalRooms: 3,
      maxAdults: 4,
      maxChildren: 2,
      bedType: "Master King Bed + Daybed",
      sizeSqFt: 450,
      description: "The pinnacle of comfort at Hotel Edesiea, featuring a separate private living lounge and scenic views.",
      descriptionMr: "हॉटेल एडेसियामधील सर्वात आलिशान स्वीट, स्वतंत्र दिवाणखाना आणि कुटुंबियांसमवेत राहण्यासाठी उत्तम जागा.",
      amenities: ["Master bedroom with King bed", "Separate private living hall", "Smart LED TV", "Mini-fridge & tea bar", "Luxury bath amenities"],
      rooms: ["401", "402", "403"],
      floor: 4,
    },
  ];

  for (const cat of categories) {
    await prisma.roomCategory.upsert({
      where: { id: cat.id },
      update: {
        basePrice: cat.basePrice,
        name: cat.name,
        nameMr: cat.nameMr,
        totalRooms: cat.totalRooms,
      },
      create: {
        id: cat.id,
        name: cat.name,
        nameMr: cat.nameMr,
        tagline: cat.tagline,
        basePrice: cat.basePrice,
        totalRooms: cat.totalRooms,
        maxAdults: cat.maxAdults,
        maxChildren: cat.maxChildren,
        bedType: cat.bedType,
        sizeSqFt: cat.sizeSqFt,
        description: cat.description,
        descriptionMr: cat.descriptionMr,
        amenitiesJson: JSON.stringify(cat.amenities),
        imageUrl: "/images/room-real.png",
      },
    });

    for (const roomNum of cat.rooms) {
      await prisma.physicalRoom.upsert({
        where: { roomNumber: roomNum },
        update: {
          categoryId: cat.id,
          floor: cat.floor,
        },
        create: {
          id: roomNum,
          roomNumber: roomNum,
          floor: cat.floor,
          categoryId: cat.id,
          operationalStatus: "AVAILABLE",
          housekeepingStatus: "CLEAN",
        },
      });
    }
  }
  console.log("✓ 4 Room Categories & 12 Physical Rooms seeded");

  // 3. Provision 8 Staff Accounts with RBAC
  const defaultPassword = hashPassword("Edesiea@Pali2026");
  const staffMembers = [
    {
      name: "Owner / Super Administrator",
      email: "admin@hoteledesiea.com",
      roles: ["SUPER_ADMIN", "HOTEL_MANAGER", "ACCOUNTANT"],
    },
    {
      name: "Hotel General Manager",
      email: "manager@hoteledesiea.com",
      roles: ["HOTEL_MANAGER"],
    },
    {
      name: "Front Desk Receptionist",
      email: "reception@hoteledesiea.com",
      roles: ["RECEPTIONIST"],
    },
    {
      name: "Housekeeping Supervisor",
      email: "housekeeping@hoteledesiea.com",
      roles: ["HOUSEKEEPING"],
    },
    {
      name: "Restaurant Manager",
      email: "restaurant@hoteledesiea.com",
      roles: ["RESTAURANT_MANAGER"],
    },
    {
      name: "Head Chef & Kitchen Lead",
      email: "kitchen@hoteledesiea.com",
      roles: ["KITCHEN"],
    },
    {
      name: "Accounts & Finance Lead",
      email: "accounts@hoteledesiea.com",
      roles: ["ACCOUNTANT"],
    },
    {
      name: "Maintenance Supervisor",
      email: "maintenance@hoteledesiea.com",
      roles: ["MAINTENANCE"],
    },
  ];

  for (const staff of staffMembers) {
    const user = await prisma.user.upsert({
      where: { email: staff.email },
      update: { name: staff.name },
      create: {
        name: staff.name,
        email: staff.email,
        phone: "+91 8855887673",
        passwordHash: defaultPassword,
        isActive: true,
      },
    });

    // Delete existing roles and assign
    await prisma.userRole.deleteMany({ where: { userId: user.id } });
    for (const role of staff.roles) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          role: role,
        },
      });
    }
  }
  console.log("✓ 8 Role-Provisioned Staff Accounts created");

  // 4. Restaurant Categories & Selected Menu Items
  const restCats = [
    { id: "south-indian", name: "South Indian Special" },
    { id: "idli-vada", name: "Idli & Vada" },
    { id: "uttapam", name: "Uttapam" },
    { id: "maharashtrian-snacks", name: "Maharashtrian Snacks" },
    { id: "pav-bhaji", name: "Paratha & Pav Bhaji" },
    { id: "thali", name: "Edesiea Thali Menu" },
    { id: "tandoor", name: "Tandoor & Tikka" },
    { id: "curries", name: "Indian Curries & Dal" },
    { id: "breads", name: "Roti & Breads" },
    { id: "pizzas", name: "10-inch Gourmet Pizzas" },
  ];

  for (let i = 0; i < restCats.length; i++) {
    const c = restCats[i];
    await prisma.restaurantCategory.upsert({
      where: { id: c.id },
      update: { name: c.name, displayOrder: i },
      create: { id: c.id, name: c.name, displayOrder: i },
    });
  }

  const items = [
    // South Indian
    { id: "si-1", cat: "south-indian", name: "Ghee Sadha Dosa", price: 99, jain: true },
    { id: "si-2", cat: "south-indian", name: "Ghee Masala Dosa", price: 100, jain: false },
    { id: "si-8", cat: "south-indian", name: "Ghee Podi Masala Dosa", price: 140, jain: true, special: true },
    { id: "si-11", cat: "south-indian", name: "Benne Dosa", price: 160, jain: true, special: true },
    // Idli/Vada
    { id: "iv-1", cat: "idli-vada", name: "Idli Sambar", price: 80, jain: true },
    { id: "iv-3", cat: "idli-vada", name: "Ghee Thatte Idli", price: 99, jain: true, special: true },
    { id: "iv-7", cat: "idli-vada", name: "Medu Vada Sambar", price: 90, jain: true },
    // Maharashtrian
    { id: "mh-3", cat: "maharashtrian-snacks", name: "Shera (Prasad Style)", price: 80, jain: true, special: true },
    { id: "mh-7", cat: "maharashtrian-snacks", name: "Thalipeeth with Loni & Thecha", price: 110, jain: false, special: true },
    { id: "mh-8", cat: "maharashtrian-snacks", name: "Special Misal Pav", price: 99, jain: false, special: true },
    // Pav Bhaji
    { id: "pb-1", cat: "pav-bhaji", name: "Amul Special Pav Bhaji", price: 130, jain: true },
    { id: "pb-5", cat: "pav-bhaji", name: "Edesiea Special Pav Bhaji", price: 180, jain: false, special: true },
    // Thalis
    { id: "th-1", cat: "thali", name: "Punjabi Thali", price: 200, jain: true, desc: "Paneer subji, veg subji, dal tadka, jeera rice, 3 rotis, salad, sweet" },
    { id: "th-2", cat: "thali", name: "Maharashtrian Thali", price: 349, jain: false, special: true, desc: "Mass vadi rassa, shingolychi bhaji, shevga fry, varan bhaat, bhakri/chapati, thecha" },
    { id: "th-3", cat: "thali", name: "Special Chaturthi Thali", price: 449, jain: true, special: true, desc: "Ukadiche Modak / Puran Poli with Sajuk Tup, Phulka, Amti, Masala Bhaat, Sol Kadhi" },
    // Curries & Tandoor
    { id: "cr-1", cat: "curries", name: "Paneer Ghee Roast", price: 309, jain: true, special: true },
    { id: "cr-2", cat: "curries", name: "Malabar Veg Curry", price: 309, jain: true },
    { id: "cr-5", cat: "curries", name: "Dal Makhani", price: 229, jain: true },
    { id: "td-1", cat: "tandoor", name: "Amritsari Paneer Tikka", price: 259, jain: true },
    { id: "td-5", cat: "tandoor", name: "Veg Platter (24 pcs 6 Tikkas)", price: 799, jain: false, special: true },
    // Breads
    { id: "br-1", cat: "breads", name: "Butter Cheese Naan", price: 130, jain: true },
    { id: "br-2", cat: "breads", name: "Garlic Butter Naan", price: 100, jain: false },
    { id: "br-4", cat: "breads", name: "Jwar / Bajri Bhakri", price: 60, jain: true },
    // Pizzas
    { id: "pz-1", cat: "pizzas", name: "Margherita 10-inch Pizza", price: 299, jain: true },
    { id: "pz-3", cat: "pizzas", name: "The Green Garden Pesto Pizza", price: 409, jain: true, special: true },
  ];

  for (const it of items) {
    await prisma.menuItem.upsert({
      where: { id: it.id },
      update: { price: it.price, name: it.name },
      create: {
        id: it.id,
        categoryId: it.cat,
        name: it.name,
        price: it.price,
        isJainAvailable: it.jain,
        isChefSpecial: it.special || false,
        description: it.desc || null,
      },
    });
  }
  console.log("✓ Restaurant Menu & Categories seeded");

  // 5. Dining Tables
  for (let i = 1; i <= 12; i++) {
    const tableId = `T-${i}`;
    const floor = i <= 4 ? "GROUND" : i <= 8 ? "ROOFTOP_4TH" : "ROOFTOP_5TH";
    await prisma.diningTable.upsert({
      where: { tableNumber: tableId },
      update: {},
      create: {
        id: tableId,
        tableNumber: tableId,
        floor: floor,
        capacity: i % 2 === 0 ? 6 : 4,
        status: "AVAILABLE",
      },
    });
  }
  console.log("✓ 12 Dining Tables seeded");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
