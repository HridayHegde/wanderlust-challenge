import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.destination.deleteMany({})

  const destinations = [
    {
      name: "Paris",
      location: "France",
      description: "The City of Light, known for the Eiffel Tower and Louvre Museum.",
      imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    },
    {
      name: "Tokyo",
      location: "Japan",
      description: "A bustling metropolis blending ultramodern and traditional.",
      imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26",
    },
    {
      name: "New York",
      location: "USA",
      description: "The Big Apple, featuring iconic landmarks like Times Square and Central Park.",
      imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
    },
  ]

  Promise.all(
    destinations.map((destination) =>
      prisma.destination.create({
        data: destination,
      }),
    ),
  )

  console.log("Seed data inserted successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
