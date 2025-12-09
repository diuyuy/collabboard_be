import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { CreateListDto } from './dto/create-list.dto';
import { ListResponseDto } from './dto/list-response.dto';

@Injectable()
export class ListService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    boardId: string,
    createListDto: CreateListDto,
  ): Promise<ListResponseDto> {
    const list = await this.prismaService.list.create({
      data: {
        ...createListDto,
        boardId,
      },
    });

    return ListResponseDto.from(list);
  }

  findAll() {
    return `This action returns all list`;
  }

  findOne(id: number) {
    return `This action returns a #${id} list`;
  }

  remove(id: number) {
    return `This action removes a #${id} list`;
  }
}
