import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiResponse } from 'src/core/api-response/api-response';
import { PageResponse } from 'src/core/api-response/page-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { RequestWithUser } from 'src/features/auth/types/types';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceResponseDto } from './dto/workspace-response.dto';
import { WorkspaceService } from './workspace.service';

@Controller('v1/workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

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

  @Get(':id')
  async findOne(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<ApiResponse<WorkspaceResponseDto>> {
    const workspace = await this.workspaceService.findOne(req.user.id, id);

    return ApiResponse.success(workspace);
  }

  @Patch(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<ApiResponse<WorkspaceResponseDto>> {
    const updatedWorkspace = await this.workspaceService.update(
      req.user.id,
      id,
      updateWorkspaceDto,
    );

    return ApiResponse.success(updatedWorkspace);
  }

  @Delete(':id')
  async remove(
    @Req() req: RequestWithUser,
    @Param('id') workspaceId: string,
  ): Promise<ApiResponse<void>> {
    await this.workspaceService.remove(req.user.id, workspaceId);

    return ApiResponse.success();
  }
}
