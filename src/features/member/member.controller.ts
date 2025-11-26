import { Controller, Delete, Get, Param } from '@nestjs/common';
import { MemberService } from './member.service';

@Controller('v1/member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  findAll() {
    return this.memberService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.memberService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
  //   return this.memberService.update(+id, updateMemberDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberService.remove(+id);
  }
}
