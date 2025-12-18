import { Controller, Get, Req } from '@nestjs/common';
import { ApiResponse } from 'src/core/api-response/api-response';
import { RequestWithUser } from '../auth/types/types';
import { MemberResponseDto } from './dto/member-response.dto';
import { MemberService } from './member.service';

@Controller('v1/members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('me')
  async getMyProfile(
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<MemberResponseDto>> {
    const member = await this.memberService.getMyProfile(req.user.id);

    return ApiResponse.success(member);
  }
}
