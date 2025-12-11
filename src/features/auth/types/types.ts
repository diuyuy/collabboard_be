import { Request } from 'express';
import { MemberRole } from 'generated/prisma/enums';

export type MemberInfo = {
  id: string;
  role: MemberRole;
};

export type RequestWithUser = Omit<Request, 'user'> & { user: MemberInfo };

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
