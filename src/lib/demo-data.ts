import { prisma } from "@/lib/prisma";
import { DEFAULT_CHECKLIST_FR } from "@/lib/compliance";

const DEMO_PROPERTIES = [
  {
    name: "Le Marais Studio",
    address: "12 Rue des Rosiers",
    city: "Paris",
    country: "France",
    propertyType: "studio",
    airbnbUrl: "https://airbnb.com/rooms/example-paris",
    registrationNumber: "75112-STR-2024-00847",
    issuingAuthority: "Mairie de Paris — 12e arrondissement",
    status: "active",
    issueDate: new Date("2024-03-15"),
    expiryDate: new Date("2027-03-15"),
  },
  {
    name: "Vieux-Port Apartment",
    address: "45 Quai du Port",
    city: "Marseille",
    country: "France",
    propertyType: "apartment",
    bookingUrl: "https://booking.com/hotel/example-marseille",
    registrationNumber: "13055-STR-2023-12091",
    issuingAuthority: "Métropole Aix-Marseille-Provence",
    status: "active",
    issueDate: new Date("2023-11-01"),
    expiryDate: new Date("2026-09-20"),
  },
  {
    name: "Presqu'île Flat",
    address: "8 Rue de la République",
    city: "Lyon",
    country: "France",
    propertyType: "apartment",
    airbnbUrl: "https://airbnb.com/rooms/example-lyon",
    registrationNumber: null,
    issuingAuthority: "Métropole de Lyon",
    status: "pending",
    issueDate: null,
    expiryDate: null,
  },
];

export async function seedDemoData(userId: string, locale: string) {
  const checklist = locale === "fr" ? DEFAULT_CHECKLIST_FR : undefined;

  for (const demo of DEMO_PROPERTIES) {
    const existing = await prisma.property.findFirst({
      where: { userId, name: demo.name },
    });
    if (existing) continue;

    const property = await prisma.property.create({
      data: {
        userId,
        name: demo.name,
        address: demo.address,
        city: demo.city,
        country: demo.country,
        propertyType: demo.propertyType,
        airbnbUrl: demo.airbnbUrl,
        bookingUrl: demo.bookingUrl,
      },
    });

    await prisma.registration.create({
      data: {
        propertyId: property.id,
        registrationNumber: demo.registrationNumber,
        issuingAuthority: demo.issuingAuthority,
        status: demo.status,
        issueDate: demo.issueDate,
        expiryDate: demo.expiryDate,
      },
    });

    const items = checklist ?? [
      "Obtain municipal registration number",
      "Declare property to local tax authority",
      "Verify maximum rental nights allowed",
      "Register with national STR database (if required)",
      "Prepare guest data retention policy",
      "Update platform listing with registration number",
    ];

    for (let i = 0; i < items.length; i++) {
      await prisma.checklistItem.create({
        data: {
          propertyId: property.id,
          title: items[i],
          completed: i < 3 && demo.status === "active",
          sortOrder: i,
        },
      });
    }
  }
}
