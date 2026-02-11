import { Role, TransactionType } from '@prisma/client';

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface RequestWithUser extends Express.Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export { Role, TransactionType };
