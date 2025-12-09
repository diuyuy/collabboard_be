import { CardPriority, CardStatus } from 'generated/prisma/enums';

export type BoardDetailFromPrisma = {
  List: ({
    Card: ({
      CardAssignee: ({
        Member: {
          id: string;
          nickname: string | null;
        };
      } & {
        id: string;
        createdAt: Date;
        memberId: string;
        cardId: string;
      })[];
      CardLabel: ({
        Label: {
          title: string;
          id: string;
          color: string;
        };
      } & {
        id: string;
        cardId: string;
        labelId: string;
      })[];
      _count: {
        Comment: number;
      };
    } & {
      description: string | null;
      title: string;
      id: string;
      position: string;
      priority: CardPriority;
      createdAt: Date;
      updatedAt: Date;
      listId: string | null;
      status: CardStatus;
    })[];
  } & {
    title: string;
    id: string;
    position: string;
    createdAt: Date;
    updatedAt: Date;
    boardId: string;
  })[];
} & {
  id: string;
  title: string;
  backgroundColor: string;
  ownerId: string | null;
};
