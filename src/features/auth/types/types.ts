import { Request } from 'express';
import { Member_role } from 'generated/prisma/enums';

export type MemberInfo = {
  id: string;
  role: Member_role;
};

export type RequestWithUser = Omit<Request, 'user'> & { user: MemberInfo };
