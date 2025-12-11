import { Injectable } from '@nestjs/common';
import { InvitationStatus } from 'generated/prisma/enums';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationListItemDto } from './dto/invitation-list-response.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';

@Injectable()
export class InvitationService {
  constructor(private readonly prismaService: PrismaService) {}

  async createInvitation(
    workspaceId: string,
    inviterId: string,
    createInvitationDto: CreateInvitationDto,
  ): Promise<InvitationResponseDto[]> {
    // Validate workspace exists
    const workspace = await this.prismaService.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.WORKSPACE_NOT_FOUND),
      );
    }

    //Validate email exists
    for (const invitee of createInvitationDto.invitees) {
      const member = await this.prismaService.member.findUnique({
        select: {
          id: true,
        },
        where: {
          email: invitee.email,
        },
      });

      if (!member)
        throw new CommonHttpException(
          ResponseStatusFactory.create(ResponseCode.MEMBER_DOES_NOT_EXSIT),
        );
    }

    // Create invitations for all invitees with their respective roles
    const invitations = await this.prismaService.invitation.createManyAndReturn(
      {
        data: createInvitationDto.invitees.map(({ email, role }) => ({
          workspaceId,
          inviterId,
          inviteeEmail: email,
          role,
        })),
      },
    );

    // Return invitation codes with their respective roles
    return invitations.map((invitation) =>
      InvitationResponseDto.from(invitation.id, workspaceId, invitation.role),
    );
  }

  async getMyInvitations(memberId: string): Promise<InvitationListItemDto[]> {
    // Get member's email
    const member = await this.prismaService.member.findUnique({
      where: { id: memberId },
      select: { email: true },
    });

    if (!member) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.MEMBER_NOT_FOUND),
      );
    }

    const invitations = await this.prismaService.invitation.findMany({
      where: {
        inviteeEmail: member.email,
        status: InvitationStatus.PENDING,
      },
      include: {
        Workspace: {
          select: {
            name: true,
          },
        },
        Member: {
          select: {
            email: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invitations.map(InvitationListItemDto.from);
  }

  async acceptInvitation(
    invitationId: string,
    memberId: string,
  ): Promise<void> {
    // Find invitation by ID
    const invitation = await this.prismaService.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.INVITATION_NOT_FOUND),
      );
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.INVITATION_ALREADY_PROCESSED),
      );
    }

    // Verify that the member's email matches the invitation
    const member = await this.prismaService.member.findUnique({
      where: { id: memberId },
    });

    if (!member || member.email !== invitation.inviteeEmail) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.UNAUTHORIZED),
      );
    }

    // Check if member is already in workspace
    const existingMember = await this.prismaService.workspaceMember.findUnique({
      where: {
        workspaceId_memberId: {
          workspaceId: invitation.workspaceId,
          memberId,
        },
      },
    });

    if (existingMember) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.MEMBER_ALREADY_IN_WORKSPACE),
      );
    }

    // Add member to workspace with the role from invitation and update invitation status in transaction
    await this.prismaService.$transaction([
      this.prismaService.workspaceMember.create({
        data: {
          workspaceId: invitation.workspaceId,
          memberId,
          role: invitation.role,
        },
      }),
      this.prismaService.invitation.update({
        where: { id: invitationId },
        data: {
          status: InvitationStatus.ACCEPTED,
        },
      }),
    ]);
  }
}
