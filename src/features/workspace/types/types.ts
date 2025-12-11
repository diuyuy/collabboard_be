import { InvitationStatus, WorkspaceRole } from 'generated/prisma/enums';

export type InvitationListFromPrisma = {
  Member: {
    email: string;
    nickname: string | null;
  };
  Workspace: {
    name: string;
  };
} & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
  inviteeEmail: string;
  role: WorkspaceRole;
  inviterId: string;
  status: InvitationStatus;
};
