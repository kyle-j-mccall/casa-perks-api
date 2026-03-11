import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.transaction.deleteMany();
  await prisma.resident.deleteMany();
  await prisma.giftCard.deleteMany();

  // Seed Resident
  const resident = await prisma.resident.create({
    data: {
      id: 'resident-001',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      unit: '3B',
      pointsBalance: 10000,
    },
  });
  console.log('✅ Created resident:', resident.id);

  // Seed Transactions
  const transactions = await prisma.transaction.createMany({
    data: [
      {
        id: 'txn-001',
        residentId: 'resident-001',
        type: 'earned',
        points: 500,
        description: 'On-time rent payment — February',
        date: new Date('2026-02-01T09:00:00Z'),
      },
      {
        id: 'txn-002',
        residentId: 'resident-001',
        type: 'bonus',
        points: 200,
        description: 'Referral bonus — Jamie Chen',
        date: new Date('2026-01-18T14:30:00Z'),
      },
      {
        id: 'txn-003',
        residentId: 'resident-001',
        type: 'redeemed',
        points: -1000,
        description: 'Redeemed: Amazon Gift Card $10',
        date: new Date('2026-01-10T11:00:00Z'),
        giftCardId: 'gc-001',
      },
      {
        id: 'txn-004',
        residentId: 'resident-001',
        type: 'earned',
        points: 500,
        description: 'On-time rent payment — January',
        date: new Date('2026-01-01T09:00:00Z'),
      },
      {
        id: 'txn-005',
        residentId: 'resident-001',
        type: 'earned',
        points: 150,
        description: 'Package pickup — Locker system use',
        date: new Date('2025-12-20T16:00:00Z'),
      },
      {
        id: 'txn-006',
        residentId: 'resident-001',
        type: 'earned',
        points: 500,
        description: 'On-time rent payment — December',
        date: new Date('2025-12-01T09:00:00Z'),
      },
      {
        id: 'txn-007',
        residentId: 'resident-001',
        type: 'bonus',
        points: 750,
        description: 'Lease renewal bonus',
        date: new Date('2025-11-15T10:00:00Z'),
      },
      {
        id: 'txn-008',
        residentId: 'resident-001',
        type: 'redeemed',
        points: -1500,
        description: 'Redeemed: Starbucks Gift Card $15',
        date: new Date('2025-11-05T13:00:00Z'),
        giftCardId: 'gc-002',
      },
      {
        id: 'txn-009',
        residentId: 'resident-001',
        type: 'earned',
        points: 500,
        description: 'On-time rent payment — November',
        date: new Date('2025-11-01T09:00:00Z'),
      },
      {
        id: 'txn-010',
        residentId: 'resident-001',
        type: 'expired',
        points: -350,
        description: 'Points expired — 12-month inactivity',
        date: new Date('2025-10-01T00:00:00Z'),
      },
    ],
  });
  console.log(`✅ Created ${transactions.count} transactions`);

  // Seed Gift Cards
  const giftCards = await prisma.giftCard.createMany({
    data: [
      {
        id: 'gc-001',
        brand: 'Amazon',
        description: '$10 Amazon Gift Card',
        pointsCost: 1000,
        category: 'retail',
        inStock: true,
      },
      {
        id: 'gc-002',
        brand: 'Starbucks',
        description: '$15 Starbucks Gift Card',
        pointsCost: 1500,
        category: 'food',
        inStock: true,
      },
      {
        id: 'gc-003',
        brand: 'Visa',
        description: '$25 Visa Prepaid Card',
        pointsCost: 2500,
        category: 'other',
        inStock: true,
      },
      {
        id: 'gc-004',
        brand: 'DoorDash',
        description: '$20 DoorDash Credit',
        pointsCost: 2000,
        category: 'food',
        inStock: true,
      },
      {
        id: 'gc-005',
        brand: 'Netflix',
        description: '1 Month Netflix Standard',
        pointsCost: 1800,
        category: 'entertainment',
        inStock: true,
      },
      {
        id: 'gc-006',
        brand: 'Target',
        description: '$10 Target Gift Card',
        pointsCost: 1000,
        category: 'retail',
        inStock: false,
      },
    ],
  });
  console.log(`✅ Created ${giftCards.count} gift cards`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
