import { Injectable } from '@nestjs/common';
import {
  CardPriority,
  CardStatus,
  WorkspaceRole,
} from 'generated/prisma/enums';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { LexorankService } from '../../core/infrastructure/lexorank/lexorank.service';
import { CardAssigneeResponseDto } from './dto/card-assignee-response.dto';
import { CardDetailResponseDto } from './dto/card-detail-response.dto';
import { CardLabelResponseDto } from './dto/card-label-response.dto';
import { CardResponseDto } from './dto/card-response.dto';
import { CreateCardDto } from './dto/create-card.dto';
import { MoveCardResponseDto } from './dto/move-card-response.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly lexorankService: LexorankService,
  ) {}

  async create(
    listId: string,
    createCardDto: CreateCardDto,
  ): Promise<CardResponseDto> {
    // Validate list exists
    const list = await this.prismaService.list.findUnique({
      select: {
        boardId: true,
      },
      where: { id: listId },
    });

    if (!list) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.LIST_NOT_FOUND),
      );
    }

    // Validate assignees if provided
    if (createCardDto.assigneeIds && createCardDto.assigneeIds.length > 0) {
      const members = await this.prismaService.member.findMany({
        where: { id: { in: createCardDto.assigneeIds } },
      });

      if (members.length !== createCardDto.assigneeIds.length) {
        throw new CommonHttpException(
          ResponseStatusFactory.create(ResponseCode.INVALID_ASSIGNEE),
        );
      }
    }

    // Validate labels if provided
    if (createCardDto.labelIds && createCardDto.labelIds.length > 0) {
      const labels = await this.prismaService.label.findMany({
        where: { id: { in: createCardDto.labelIds } },
      });

      if (labels.length !== createCardDto.labelIds.length) {
        throw new CommonHttpException(
          ResponseStatusFactory.create(ResponseCode.INVALID_LABEL),
        );
      }
    }

    const position = this.lexorankService.generatePosition(
      createCardDto.previousPosition,
      createCardDto.nextPosition,
    );

    // Create card with relations
    const card = await this.prismaService.card.create({
      data: {
        title: createCardDto.title,
        description: createCardDto.description,
        listId,
        boardId: list.boardId,
        position,
        priority: createCardDto.priority || CardPriority.MEDIUM,
        status: CardStatus.TODO,
        CardAssignee: createCardDto.assigneeIds
          ? {
              create: createCardDto.assigneeIds.map((memberId) => ({
                memberId,
              })),
            }
          : undefined,
        CardLabel: createCardDto.labelIds
          ? {
              create: createCardDto.labelIds.map((labelId) => ({
                labelId,
              })),
            }
          : undefined,
      },
      include: {
        CardAssignee: {
          include: {
            Member: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
        CardLabel: {
          include: {
            Label: {
              select: {
                id: true,
                title: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            Comment: true,
          },
        },
      },
    });

    return CardResponseDto.from(card);
  }

  async findOne(cardId: string): Promise<CardDetailResponseDto> {
    const card = await this.prismaService.card.findUnique({
      where: { id: cardId },
      include: {
        CardAssignee: {
          include: {
            Member: {
              select: {
                id: true,
                nickname: true,
                imageUrl: true,
              },
            },
          },
        },
        CardLabel: {
          include: {
            Label: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        Comment: {
          where: {
            Member: {
              isNot: null,
            },
          },
          include: {
            Member: {
              select: {
                id: true,
                nickname: true,
                email: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!card) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.CARD_NOT_FOUND),
      );
    }

    return CardDetailResponseDto.from(card);
  }

  async update(cardId: string, updateCardDto: UpdateCardDto): Promise<void> {
    // Validate card exists
    const card = await this.prismaService.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.CARD_NOT_FOUND),
      );
    }

    // Validate assignees if provided
    if (updateCardDto.assigneeIds && updateCardDto.assigneeIds.length > 0) {
      const members = await this.prismaService.member.findMany({
        where: { id: { in: updateCardDto.assigneeIds } },
      });

      if (members.length !== updateCardDto.assigneeIds.length) {
        throw new CommonHttpException(
          ResponseStatusFactory.create(ResponseCode.INVALID_ASSIGNEE),
        );
      }
    }

    // Validate labels if provided
    if (updateCardDto.labelIds && updateCardDto.labelIds.length > 0) {
      const labels = await this.prismaService.label.findMany({
        where: { id: { in: updateCardDto.labelIds } },
      });

      if (labels.length !== updateCardDto.labelIds.length) {
        throw new CommonHttpException(
          ResponseStatusFactory.create(ResponseCode.INVALID_LABEL),
        );
      }
    }

    // Use transaction to update card and relations
    await this.prismaService.$transaction(async (tx) => {
      // Update card basic fields
      await tx.card.update({
        where: { id: cardId },
        data: {
          title: updateCardDto.title,
          description: updateCardDto.description,
          priority: updateCardDto.priority,
        },
      });

      // Update assignees if provided
      if (updateCardDto.assigneeIds !== undefined) {
        // Delete existing assignees
        await tx.cardAssignee.deleteMany({
          where: { cardId },
        });

        // Create new assignees
        if (updateCardDto.assigneeIds.length > 0) {
          await tx.cardAssignee.createMany({
            data: updateCardDto.assigneeIds.map((memberId) => ({
              cardId,
              memberId,
            })),
          });
        }
      }

      // Update labels if provided
      if (updateCardDto.labelIds !== undefined) {
        // Delete existing labels
        await tx.cardLabel.deleteMany({
          where: { cardId },
        });

        // Create new labels
        if (updateCardDto.labelIds.length > 0) {
          await tx.cardLabel.createMany({
            data: updateCardDto.labelIds.map((labelId) => ({
              cardId,
              labelId,
            })),
          });
        }
      }
    });
  }

  async move(
    cardId: string,
    { listId, previousPosition, nextPosition }: MoveCardDto,
  ): Promise<MoveCardResponseDto> {
    // Validate card exists
    const card = await this.prismaService.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.CARD_NOT_FOUND),
      );
    }

    // Validate target list exists
    const targetList = await this.prismaService.list.findUnique({
      where: { id: listId },
    });

    if (!targetList) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.LIST_NOT_FOUND),
      );
    }

    const position = this.lexorankService.generatePosition(
      previousPosition,
      nextPosition,
    );

    // Update card position and list
    const updatedCard = await this.prismaService.card.update({
      where: { id: cardId },
      data: {
        listId,
        position,
      },
    });

    return MoveCardResponseDto.from({ ...updatedCard, listId });
  }

  async remove(cardId: string): Promise<{ id: string }> {
    // Validate card exists
    const card = await this.prismaService.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.CARD_NOT_FOUND),
      );
    }

    // Delete card (assignees, labels, comments will be cascade deleted)
    await this.prismaService.card.delete({
      where: { id: cardId },
    });

    return { id: cardId };
  }

  async addAssignee(
    cardId: string,
    memberId: string,
  ): Promise<CardAssigneeResponseDto> {
    // Validate card exists
    const card = await this.prismaService.card.findUnique({
      where: { id: cardId },
      include: {
        List: {
          include: {
            Board: {
              include: {
                Workspace: {
                  include: {
                    WorkspaceMember: {
                      where: {
                        memberId,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!card) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.CARD_NOT_FOUND),
      );
    }

    // Validate member exists
    const member = await this.prismaService.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.MEMBER_NOT_FOUND),
      );
    }

    // Validate member is in workspace
    if (
      !card.List?.Board?.Workspace?.WorkspaceMember ||
      card.List.Board.Workspace.WorkspaceMember.length === 0
    ) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.ASSIGNEE_NOT_IN_WORKSPACE),
      );
    }

    const cardAssignee = await this.prismaService.cardAssignee.upsert({
      create: {
        cardId,
        memberId,
      },
      update: {},
      where: {
        memberId_cardId: {
          memberId,
          cardId,
        },
      },
    });

    return CardAssigneeResponseDto.from(cardAssignee);
  }

  async removeAssignee(
    cardId: string,
    memberId: string,
  ): Promise<{ memberId: string }> {
    // Find card assignee
    const cardAssignee = await this.prismaService.cardAssignee.findUnique({
      where: {
        memberId_cardId: {
          memberId,
          cardId,
        },
      },
    });

    if (!cardAssignee) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.CARD_ASSIGNEE_NOT_FOUND),
      );
    }

    // Delete card assignee
    await this.prismaService.cardAssignee.delete({
      where: {
        id: cardAssignee.id,
      },
    });

    return { memberId };
  }

  async addLabel(
    cardId: string,
    labelId: string,
  ): Promise<CardLabelResponseDto> {
    // Validate card exists and get its board
    const card = await this.prismaService.card.findUnique({
      where: { id: cardId },
      include: {
        List: {
          select: {
            boardId: true,
          },
        },
      },
    });

    if (!card) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.CARD_NOT_FOUND),
      );
    }

    // Validate label exists and belongs to the same board
    const label = await this.prismaService.label.findUnique({
      where: { id: labelId },
    });

    if (!label) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.LABEL_NOT_FOUND),
      );
    }

    if (label.boardId !== card.List?.boardId) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.LABEL_NOT_IN_BOARD),
      );
    }

    const cardLabel = await this.prismaService.cardLabel.upsert({
      create: {
        cardId,
        labelId,
      },
      update: {},
      where: {
        labelId_cardId: {
          labelId,
          cardId,
        },
      },
    });

    return CardLabelResponseDto.from(cardLabel);
  }

  async removeLabel(cardId: string, labelId: string): Promise<void> {
    // Find card label
    const cardLabel = await this.prismaService.cardLabel.findUnique({
      where: {
        labelId_cardId: {
          labelId,
          cardId,
        },
      },
    });

    if (!cardLabel) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.CARD_LABEL_NOT_FOUND),
      );
    }

    // Delete card label
    await this.prismaService.cardLabel.delete({
      where: {
        id: cardLabel.id,
      },
    });
  }

  async validateAccessCardAuthority(
    memberId: string,
    cardId: string,
  ): Promise<void> {
    await this.getWorkspaceMemberRole(memberId, cardId);
  }

  async validateModifyCardAuthority(
    memberId: string,
    cardId: string,
  ): Promise<void> {
    const workspaceMember = await this.getWorkspaceMemberRole(memberId, cardId);

    if (workspaceMember.role === 'VIEWER')
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.MODIFY_CARD_DENIED),
      );
  }

  private async getWorkspaceMemberRole(
    memberId: string,
    cardId: string,
  ): Promise<{ role: WorkspaceRole }> {
    const card = await this.prismaService.card.findUnique({
      select: {
        Board: {
          select: {
            Workspace: {
              select: {
                WorkspaceMember: {
                  select: {
                    role: true,
                  },
                  where: {
                    memberId,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        id: cardId,
      },
    });

    if (!card)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.CARD_NOT_FOUND),
      );

    const workspaceMember = card.Board.Workspace.WorkspaceMember.at(0);

    if (!workspaceMember)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.ACCESS_CARD_DENIED),
      );

    return workspaceMember;
  }
}
