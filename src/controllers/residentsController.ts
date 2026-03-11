import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { TransactionType } from '../types';

export async function getResident(req: Request, res: Response): Promise<void> {
  const resident = await prisma.resident.findUnique({
    where: { id: String(req.params.id) },
  });

  if (!resident) {
    res.status(404).json({ error: `Resident '${req.params.id}' not found.` });
    return;
  }

  res.json({ data: resident });
}

export async function getTransactions(req: Request, res: Response): Promise<void> {
  const residentId = String(req.params.id);
  const resident = await prisma.resident.findUnique({
    where: { id: residentId },
  });

  if (!resident) {
    res.status(404).json({ error: `Resident '${residentId}' not found.` });
    return;
  }

  let limit = parseInt(req.query.limit as string, 10);
  if (isNaN(limit) || limit <= 0) limit = 50;
  if (limit > 100) limit = 100;

  const type = req.query.type as string | undefined;
  const allowedTypes: TransactionType[] = ['earned', 'bonus', 'redeemed', 'expired'];

  if (type && !allowedTypes.includes(type as TransactionType)) {
    res.status(400).json({
      error: `Invalid query param 'type'. Must be one of: ${allowedTypes.join(', ')}.`,
    });
    return;
  }

  const where: any = { residentId };
  if (type) {
    where.type = type;
  }

  const [result, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  // Convert Date objects to ISO strings for JSON response
  const data = result.map((t: any) => ({
    ...t,
    date: t.date.toISOString(),
  }));

  res.json({ data, total });
}

export async function addTransaction(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const { type, points, description } = req.body as {
    type: TransactionType;
    points: number;
    description: string;
  };

  const resident = await prisma.resident.findUnique({ where: { id } });
  if (!resident) {
    res.status(404).json({ error: `Resident '${id}' not found.` });
    return;
  }

  // Update resident balance and create transaction in a single operation
  const [updatedResident, newTransaction] = await Promise.all([
    prisma.resident.update({
      where: { id },
      data: { pointsBalance: resident.pointsBalance + points },
    }),
    prisma.transaction.create({
      data: {
        id: `txn-${randomUUID()}`,
        residentId: id,
        type,
        points,
        description,
        date: new Date(),
      },
    }),
  ]);

  res.status(201).json({
    message: 'Transaction recorded.',
    data: {
      transaction: {
        ...newTransaction,
        date: newTransaction.date.toISOString(),
      },
      newPointsBalance: updatedResident.pointsBalance,
    },
  });
}
