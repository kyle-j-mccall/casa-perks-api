import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';

export async function redeemGiftCard(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { giftCardId } = req.body as { giftCardId: string };

  // 1. Find resident
  const resident = await prisma.resident.findUnique({ where: { id } });
  if (!resident) {
    res.status(404).json({ error: `Resident '${id}' not found.` });
    return;
  }

  // 2. Find gift card
  const giftCard = await prisma.giftCard.findUnique({ where: { id: giftCardId } });
  if (!giftCard) {
    res.status(404).json({ error: `Gift card '${giftCardId}' not found.` });
    return;
  }

  if (!giftCard.inStock) {
    res.status(409).json({ error: 'This gift card is currently out of stock.' });
    return;
  }

  // 3. Check sufficient points
  if (resident.pointsBalance < giftCard.pointsCost) {
    res.status(422).json({
      error: 'Insufficient points balance.',
      detail: {
        required: giftCard.pointsCost,
        available: resident.pointsBalance,
        shortage: giftCard.pointsCost - resident.pointsBalance,
      },
    });
    return;
  }

  // 4 & 5. Deduct points and record transaction atomically
  const [updatedResident, newTransaction] = await Promise.all([
    prisma.resident.update({
      where: { id },
      data: { pointsBalance: resident.pointsBalance - giftCard.pointsCost },
    }),
    prisma.transaction.create({
      data: {
        id: `txn-${randomUUID()}`,
        residentId: id,
        type: 'redeemed',
        points: -giftCard.pointsCost,
        description: `Redeemed: ${giftCard.description}`,
        date: new Date(),
        giftCardId: giftCard.id,
      },
    }),
  ]);

  res.status(201).json({
    message: 'Redemption successful.',
    data: {
      transaction: {
        ...newTransaction,
        date: newTransaction.date.toISOString(),
      },
      newPointsBalance: updatedResident.pointsBalance,
    },
  });
}
