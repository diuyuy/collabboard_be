import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from 'src/core/api-response/api-response';
import { PageResponse } from 'src/core/api-response/page-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { RequestWithUser } from 'src/features/auth/types/types';
import { AddWorkspaceMemberDto } from './dto/add-workspace-member.dto';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceResponseDto } from './dto/workspace-response.dto';
import { WorkspaceMemberRoleGuard } from './guards/workspace-member-role.guard';
import { WorkspaceMemberService } from './workspace-member.service';
import { WorkspaceService } from './workspace.service';

@Controller('v1/workspaces')
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<ApiResponse<WorkspaceResponseDto>> {
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

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<PageResponse<WorkspaceResponseDto>>> {
    const memberId = req.user.id;
    const pageable = {
      page: 0,
      size: 10,
      sortProp: 'id' as const,
      sortDirection: 'desc' as const,
    };

    const workspacePage = await this.workspaceService.findAll(
      memberId,
      pageable,
    );

    return ApiResponse.success(workspacePage);
  }

  @Get(':workspaceId')
  async findOne(
    @Req() req: RequestWithUser,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ApiResponse<WorkspaceResponseDto>> {
    const workspace = await this.workspaceService.findOne(
      req.user.id,
      workspaceId,
    );

    return ApiResponse.success(workspace);
  }

  @Patch(':workspaceId')
  async update(
    @Req() req: RequestWithUser,
    @Param('workspaceId') workspaceId: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<ApiResponse<WorkspaceResponseDto>> {
    const updatedWorkspace = await this.workspaceService.update(
      req.user.id,
      workspaceId,
      updateWorkspaceDto,
    );

    return ApiResponse.success(updatedWorkspace);
  }

  @Delete(':workspaceId')
  async remove(
    @Req() req: RequestWithUser,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ApiResponse<void>> {
    await this.workspaceService.remove(req.user.id, workspaceId);

    return ApiResponse.success();
  }

  @UseGuards(WorkspaceMemberRoleGuard)
  @Post(':workspaceId/invites')
  async inviteMembers(
    @Param('workspaceId') workspaceId: string,
    @Body() addWorkspaceMemberDto: AddWorkspaceMemberDto,
  ): Promise<ApiResponse<void>> {
    await this.workspaceMemberService.addMembers(
      workspaceId,
      addWorkspaceMemberDto,
    );

    return ApiResponse.success();
  }
}
