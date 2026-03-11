import { Request, Response, NextFunction } from 'express';

/**
 * Validates a resident ID path parameter.
 * Resident IDs must match the pattern res-\d+ (e.g. res-001).
 */
export function validateResidentId(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;
  if (!id || !/^resident-\d+$/.test(String(id))) {
    res.status(400).json({ error: 'Invalid resident ID format.' });
    return;
  }
  next();
}

/**
 * Validates the body of a redemption request.
 * Expects: { giftCardId: string }
 */
export function validateRedemptionBody(req: Request, res: Response, next: NextFunction): void {
  const { giftCardId } = req.body as { giftCardId?: unknown };

  if (!giftCardId || typeof giftCardId !== 'string') {
    res
      .status(400)
      .json({ error: 'Missing or invalid field: giftCardId must be a non-empty string.' });
    return;
  }

  // Whitelist pattern for gift card IDs
  if (!/^gc-\d+$/.test(giftCardId)) {
    res.status(400).json({ error: 'Invalid giftCardId format.' });
    return;
  }

  next();
}

/**
 * Validates the body of a manual transaction request.
 * Expects: { type: TransactionType, points: number, description: string }
 */
export function validateTransactionBody(req: Request, res: Response, next: NextFunction): void {
  const { type, points, description } = req.body as {
    type?: unknown;
    points?: unknown;
    description?: unknown;
  };

  const allowedTypes: string[] = ['earned', 'bonus', 'redeemed', 'expired'];

  if (!type || typeof type !== 'string' || !allowedTypes.includes(type)) {
    res.status(400).json({
      error: `Invalid or missing field: type must be one of ${allowedTypes.join(', ')}.`,
    });
    return;
  }

  if (points === undefined || typeof points !== 'number' || isNaN(points)) {
    res.status(400).json({ error: 'Invalid or missing field: points must be a number.' });
    return;
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    res.status(400).json({ error: 'Invalid or missing field: description must be a non-empty string.' });
    return;
  }

  next();
}
