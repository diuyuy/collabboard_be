import { Injectable } from '@nestjs/common';
import { Member } from 'generated/prisma/client';
import { ResponseCode } from 'src/core/api-response/response-status';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { ResponseStatusFactory } from '../../core/api-response/response-status';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';

@Injectable()
export class MemberService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createMemberDto: CreateMemberDto): Promise<MemberResponseDto> {
    const member = await this.prismaService.member.create({
      data: {
        ...createMemberDto,
      },
    });

    return MemberResponseDto.from(member);
  }

  async findById(id: string): Promise<MemberResponseDto | null> {
    const member = await this.prismaService.member.findUnique({
      where: {
        id,
      },
    });

    if (!member) return null;

    return MemberResponseDto.from(member);
  }

  async getMyProfile(memberId: string): Promise<MemberResponseDto> {
    const member = await this.findById(memberId);

    if (!member)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.MEMBER_NOT_FOUND),
      );

    return member;
  }

  async findByEmail(email: string): Promise<Member | null> {
    return this.prismaService.member.findUnique({
      where: {
        email,
      },
    });
  }

  async updatePassword(email: string, password: string): Promise<void> {
    await this.prismaService.member.update({
      data: {
        password,
      },
      where: {
        email,
      },
    });
  }

  // update(id: number, updateMemberDto: UpdateMemberDto) {
  //   return `This action updates a #${id} member`;
  // }

  remove(id: number) {
    return `This action removes a #${id} member`;
  }
}
