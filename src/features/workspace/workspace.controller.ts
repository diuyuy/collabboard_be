import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse as ApiResponseDecorator,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { WorkspaceRole } from 'generated/prisma/enums';
import { ApiResponse } from 'src/core/api-response/api-response';
import { PageResponse } from 'src/core/api-response/page-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { ParseNonnegativeIntPipe } from 'src/core/pipes/parse-nonnegative-int.pipe';
import { ParsePageSortPipe } from 'src/core/pipes/parse-page-sort.pipe';
import {
  BoardSortOption,
  PageSortOption,
  WorkspaceSortOption,
} from 'src/core/types/types';
import { RequestWithUser } from 'src/features/auth/types/types';
import { BoardService } from '../board/board.service';
import { BoardResponseDto } from '../board/dto/board-response.dto';
import { CreateBoardDto } from '../board/dto/create-board.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { InvitationListItemDto } from './dto/invitation-list-response.dto';
import { InvitationResponseDto } from './dto/invitation-response.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceBriefResponseDto } from './dto/workspace-brief-response.dto';
import { WorkspaceMemberResponseDto } from './dto/workspace-member-response.dto';
import { WorkspaceResponseDto } from './dto/workspace-response.dto';
import { WorkspaceMemberRoleGuard } from './guards/workspace-member-role.guard';
import { InvitationService } from './invitation.service';
import { WorkspaceMemberService } from './workspace-member.service';
import { WorkspaceService } from './workspace.service';

@ApiTags('Workspaces')
@ApiExtraModels(
  WorkspaceResponseDto,
  InvitationResponseDto,
  InvitationListItemDto,
  WorkspaceMemberResponseDto,
  WorkspaceBriefResponseDto,
  BoardResponseDto,
  PageResponse,
)
@Controller('v1/workspaces')
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceMemberService: WorkspaceMemberService,
    private readonly invitationService: InvitationService,
    private readonly boardService: BoardService,
  ) {}

  @ApiOperation({ summary: 'Create Workspace' })
  @ApiResponseDecorator({
    status: 201,
    description: 'Workspace created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(WorkspaceBriefResponseDto) },
          },
        },
      ],
    },
  })
  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<ApiResponse<WorkspaceBriefResponseDto>> {
    const memberId = req.user.id;
    const newWorkspace = await this.workspaceService.create(
      memberId,
      createWorkspaceDto,
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.CREATED),
      newWorkspace,
    );
  }

  @ApiOperation({ summary: 'Get All Workspaces' })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'Page number (0-indexed)',
    example: 0,
  })
  @ApiQuery({
    name: 'size',
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    description: 'Sort option in format "field,direction" (e.g., "name,asc")',
    example: 'name,asc',
    required: false,
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Workspaces retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              allOf: [
                { $ref: getSchemaPath(PageResponse) },
                {
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: getSchemaPath(WorkspaceResponseDto) },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  })
  @Get()
  async findAll(
    @Query('page', ParseNonnegativeIntPipe) page: number,
    @Query('size', ParseNonnegativeIntPipe) size: number,
    @Query(
      'sort',
      new ParsePageSortPipe<WorkspaceSortOption>(['id', 'name', 'createdAt']),
    )
    sortOption: PageSortOption<WorkspaceSortOption>,
    @Req()
    req: RequestWithUser,
  ): Promise<ApiResponse<PageResponse<WorkspaceResponseDto>>> {
    const memberId = req.user.id;
    const pageable = {
      page,
      size,
      ...sortOption,
    };

    const workspacePage = await this.workspaceService.findAll(
      memberId,
      pageable,
    );

    return ApiResponse.success(workspacePage);
  }

  @ApiOperation({ summary: 'Get Workspace by ID' })
  @ApiParam({
    name: 'workspaceId',
    type: String,
    description: 'Workspace ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Workspace retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(WorkspaceResponseDto) },
          },
        },
      ],
    },
  })
  @Get(':workspaceId')
  async findOne(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<WorkspaceResponseDto>> {
    const workspace = await this.workspaceService.findOne(
      req.user.id,
      workspaceId,
    );

    return ApiResponse.success(workspace);
  }

  @ApiOperation({ summary: 'Update Workspace' })
  @ApiParam({
    name: 'workspaceId',
    type: String,
    description: 'Workspace ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Workspace updated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(WorkspaceBriefResponseDto) },
          },
        },
      ],
    },
  })
  @Patch(':workspaceId')
  async update(
    @Req() req: RequestWithUser,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<ApiResponse<WorkspaceBriefResponseDto>> {
    const updatedWorkspace = await this.workspaceService.update(
      req.user.id,
      workspaceId,
      updateWorkspaceDto,
    );

    return ApiResponse.success(updatedWorkspace);
  }

  @ApiOperation({ summary: 'Delete Workspace' })
  @ApiParam({
    name: 'workspaceId',
    type: String,
    description: 'Workspace ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Workspace deleted successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'OK' },
      },
    },
  })
  @Delete(':workspaceId')
  async remove(
    @Req() req: RequestWithUser,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
  ): Promise<ApiResponse<void>> {
    await this.workspaceService.remove(req.user.id, workspaceId);

    return ApiResponse.success();
  }

  @ApiOperation({ summary: 'Create Workspace Invitation' })
  @ApiParam({
    name: 'workspaceId',
    type: String,
    description: 'Workspace ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponseDecorator({
    status: 201,
    description: 'Invitations created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(InvitationResponseDto) },
            },
          },
        },
      ],
    },
  })
  @UseGuards(WorkspaceMemberRoleGuard)
  @Post(':workspaceId/invites')
  async createInvitation(
    @Req() req: RequestWithUser,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() createInvitationDto: CreateInvitationDto,
  ): Promise<ApiResponse<InvitationResponseDto[]>> {
    const inviterId = req.user.id;
    const invitations = await this.invitationService.createInvitation(
      workspaceId,
      inviterId,
      createInvitationDto,
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.CREATED),
      invitations,
    );
  }

  @ApiOperation({ summary: 'Get My Invitations' })
  @ApiResponseDecorator({
    status: 200,
    description: 'Invitations retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(InvitationListItemDto) },
            },
          },
        },
      ],
    },
  })
  @Get('invites/my')
  async getMyInvitations(
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<InvitationListItemDto[]>> {
    const memberId = req.user.id;
    const invitations = await this.invitationService.getMyInvitations(memberId);

    return ApiResponse.success(invitations);
  }

  @ApiOperation({ summary: 'Accept Workspace Invitation' })
  @ApiParam({
    name: 'invitationId',
    type: String,
    description: 'Invitation ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Invitation accepted successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'OK' },
      },
    },
  })
  @Post('invites/:invitationId/accept')
  async acceptInvitation(
    @Param('invitationId') invitationId: string,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<void>> {
    const memberId = req.user.id;
    await this.invitationService.acceptInvitation(invitationId, memberId);

    return ApiResponse.success();
  }

  @ApiOperation({ summary: 'Get All Workspace Members' })
  @ApiParam({
    name: 'workspaceId',
    type: String,
    description: 'Workspace ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Members retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(WorkspaceMemberResponseDto) },
            },
          },
        },
      ],
    },
  })
  @Get(':workspaceId/members')
  async findAllMembers(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
  ): Promise<ApiResponse<WorkspaceMemberResponseDto[]>> {
    const members =
      await this.workspaceMemberService.findAllMembers(workspaceId);

    return ApiResponse.success(members);
  }

  @ApiOperation({ summary: 'Update Workspace Member Role' })
  @ApiParam({
    name: 'workspaceId',
    type: String,
    description: 'Workspace ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'memberId',
    type: String,
    description: 'Member ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: Object.values(WorkspaceRole),
          example: WorkspaceRole.ADMIN,
        },
      },
      required: ['role'],
    },
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Member role updated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(WorkspaceMemberResponseDto) },
          },
        },
      ],
    },
  })
  @UseGuards(WorkspaceMemberRoleGuard)
  @Patch(':workspaceId/members/:memberId')
  async updateMemberRole(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('memberId') memberId: string,
    @Body('role') role: WorkspaceRole,
  ): Promise<ApiResponse<WorkspaceMemberResponseDto>> {
    const updatedMember =
      await this.workspaceMemberService.updateWorkspaceMemberRole(
        workspaceId,
        memberId,
        role,
      );

    return ApiResponse.success(updatedMember);
  }

  @ApiOperation({ summary: 'Remove Workspace Member' })
  @ApiParam({
    name: 'workspaceId',
    type: String,
    description: 'Workspace ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'memberId',
    type: String,
    description: 'Member ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Member removed successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'OK' },
      },
    },
  })
  @UseGuards(WorkspaceMemberRoleGuard)
  @Delete(':workspaceId/members/:memberId')
  async removeMember(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Param('memberId') memberId: string,
  ): Promise<ApiResponse<void>> {
    await this.workspaceMemberService.removeWorkspaceMember(
      workspaceId,
      memberId,
    );

    return ApiResponse.success();
  }

  @ApiOperation({ summary: 'Get All Boards in Workspace' })
  @ApiParam({
    name: 'workspaceId',
    type: String,
    description: 'Workspace ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'Page number (0-indexed)',
    example: 0,
  })
  @ApiQuery({
    name: 'size',
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    description: 'Sort option in format "field,direction" (e.g., "title,asc")',
    example: 'title,asc',
    required: false,
  })
  @ApiQuery({
    name: 'isFavorite',
    type: Boolean,
    description: 'Filter by favorite boards',
    example: true,
    required: false,
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Boards retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              allOf: [
                { $ref: getSchemaPath(PageResponse) },
                {
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: getSchemaPath(BoardResponseDto) },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  })
  @Get(':workspaceId/boards')
  async findAllBoards(
    @Req() req: RequestWithUser,
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Query('page', ParseNonnegativeIntPipe) page: number,
    @Query('size', ParseNonnegativeIntPipe) size: number,
    @Query(
      'sort',
      new ParsePageSortPipe<BoardSortOption>(['id', 'title', 'createdAt']),
    )
    sortOption: PageSortOption<BoardSortOption>,
    @Query('isFavorite', new ParseBoolPipe({ optional: true }))
    isFavorite?: boolean,
  ): Promise<ApiResponse<PageResponse<BoardResponseDto>>> {
    const memberId = req.user.id;
    const pageable = {
      page,
      size,
      ...sortOption,
    };

    const boardPage = await this.boardService.findAll(
      workspaceId,
      memberId,
      pageable,
      isFavorite,
    );

    return ApiResponse.success(boardPage);
  }

  @ApiOperation({ summary: 'Create Board in Workspace' })
  @ApiParam({
    name: 'workspaceId',
    type: String,
    description: 'Workspace ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponseDecorator({
    status: 201,
    description: 'Board created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(BoardResponseDto) },
          },
        },
      ],
    },
  })
  @Post(':workspaceId/boards')
  async createBoard(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Req() req: RequestWithUser,
    @Body() createBoardDto: CreateBoardDto,
  ): Promise<ApiResponse<BoardResponseDto>> {
    const memberId = req.user.id;
    const board = await this.boardService.create(
      workspaceId,
      memberId,
      createBoardDto,
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.CREATED),
      board,
    );
  }
}
