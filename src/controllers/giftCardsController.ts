import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getGiftCards(req: Request, res: Response): Promise<void> {
  const { brand, maxCost } = req.query;

  const where: any = { inStock: true };

  if (brand && typeof brand === 'string') {
    const safeBrand = brand.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
    where.brand = { contains: safeBrand, mode: 'insensitive' };
  }

  if (maxCost !== undefined) {
    const cost = parseInt(maxCost as string, 10);
    if (isNaN(cost) || cost < 0) {
      res.status(400).json({ error: 'maxCost must be a non-negative integer.' });
      return;
    }
    where.pointsCost = { lte: cost };
  }

  const result = await prisma.giftCard.findMany({ where });
  res.json({ data: result });
}

export async function getGiftCardById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  if (!/^gc-\d+$/.test(id)) {
    res.status(400).json({ error: 'Invalid gift card ID format.' });
    return;
  }

  const giftCard = await prisma.giftCard.findUnique({
    where: { id },
  });

  if (!giftCard) {
    res.status(404).json({ error: `Gift card '${id}' not found.` });
    return;
  }

  res.json({ data: giftCard });
}
