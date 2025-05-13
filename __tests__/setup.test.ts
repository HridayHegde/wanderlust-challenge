import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Project Setup and Configuration', () => {
  let prisma: PrismaClient

  beforeAll(() => {
    prisma = new PrismaClient()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Database Configuration', () => {
    it('should connect to the database successfully', async () => {
      // Test database connection
      const result = await prisma.$queryRaw`SELECT 1`
      expect(result).toBeDefined()
    })

    it('should have the correct schema configuration', async () => {
      // Test if Destination model exists and has correct fields
      const destination = await prisma.destination.findFirst()
      expect(destination).toBeDefined()
      
      if (destination) {
        expect(destination).toHaveProperty('id')
        expect(destination).toHaveProperty('name')
        expect(destination).toHaveProperty('location')
        expect(destination).toHaveProperty('description')
        expect(destination).toHaveProperty('imageUrl')
        expect(destination).toHaveProperty('createdAt')
        expect(destination).toHaveProperty('updatedAt')
      }
    })
  })

  describe('Environment Configuration', () => {
    it('should have required environment variables', () => {
      expect(process.env.DATABASE_URL).toBeDefined()
      expect(process.env.GOOGLE_AI_API_URL).toBeDefined()
      expect(process.env.GOOGLE_AI_API_KEY).toBeDefined()
    })
  })

  describe('Prisma Configuration', () => {
    it('should have correct binary targets for Windows compatibility', () => {
      const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma')
      const schemaContent = readFileSync(schemaPath, 'utf-8')
      expect(schemaContent).toContain('linux-musl-openssl-3.0.x')
    })

    it('should have working migrations', async () => {
      // Test if we can perform a basic database operation
      const testDestination = await prisma.destination.create({
        data: {
          name: 'Test Destination',
          location: 'Test Location',
          description: 'Test Description',
        },
      })

      expect(testDestination).toBeDefined()
      expect(testDestination.name).toBe('Test Destination')

      // Clean up test data
      await prisma.destination.delete({
        where: { id: testDestination.id },
      })
    })
  })
}) 