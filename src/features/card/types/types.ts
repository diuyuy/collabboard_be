import { Card, CardPriority, CardStatus } from 'generated/prisma/client';

export type CardResponseFromPrisma = Card & {
  CardAssignee?: Array<{ Member: { id: string; nickname: string | null } }>;
  CardLabel?: Array<{
    Label: { id: string; title: string; color: string };
  }>;
  _count?: { Comment: number };
};

export type CardDetailFromPrisma = {
  CardAssignee: ({
    Member: {
      id: string;
      nickname: string | null;
      imageUrl: string | null;
    };
  } & {
    id: string;
    createdAt: Date;
    memberId: string;
    cardId: string;
  })[];
  CardLabel: ({
    Label: {
      id: string;
      title: string;
    };
  } & {
    id: string;
    labelId: string;
    cardId: string;
  })[];
  Comment: ({
    Member: {
      id: string;
      nickname: string | null;
      email: string;
      imageUrl: string | null;
    } | null;
  } & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    memberId: string | null;
    cardId: string | null;
    content: string;
  })[];
} & {
  id: string;
  title: string;
  description: string | null;
  listId: string | null;
  position: string;
  priority: CardPriority;
  status: CardStatus;
  createdAt: Date;
  updatedAt: Date;
};
