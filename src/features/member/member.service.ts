import { Injectable } from '@nestjs/common';
import { Member } from 'generated/prisma/client';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
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

  findAll() {
    return `This action returns all member`;
  }

  async findById(id: bigint): Promise<MemberResponseDto | null> {
    const member = await this.prismaService.member.findUnique({
      where: {
        id,
      },
    });

    if (!member) return null;

    return MemberResponseDto.from(member);
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
