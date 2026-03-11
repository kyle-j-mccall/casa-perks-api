import { Request, Response, NextFunction } from 'express';

/**
 * Simple API key authentication middleware.
 *
 * In production this would be replaced by a proper auth system
 * (e.g. JWT issued after login). For this mock implementation we
 * accept a static Bearer token passed via the Authorization header.
 *
 * Expected header:
 *   Authorization: Bearer <API_KEY>
 *
 * The API key is read from the CASA_PERKS_API_KEY environment variable,
 * with a development fallback of "dev-secret-key".
 */
const VALID_API_KEY: string = process.env.CASA_PERKS_API_KEY ?? 'dev-secret-key';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res
      .status(401)
      .json({ error: 'Unauthorized. Provide a Bearer token in the Authorization header.' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (token !== VALID_API_KEY) {
    res.status(403).json({ error: 'Forbidden. Invalid API key.' });
    return;
  }

  next();
}
