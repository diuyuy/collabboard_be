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
  findAll(@Req() req: RequestWithUser) {
    const memberId = req.user.id;
    const pageable = {
      page: 0,
      size: 10,
      sortProp: 'id' as const,
      sortDirection: 'desc' as const,
    };

    return this.workspaceService.findAll(memberId, pageable);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    const memberId = req.user.id;
    return this.workspaceService.findOne(memberId, id);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    const memberId = req.user.id;
    return this.workspaceService.update(memberId, id, updateWorkspaceDto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const memberId = req.user.id;
    return this.workspaceService.remove(id, memberId);
  }
}
