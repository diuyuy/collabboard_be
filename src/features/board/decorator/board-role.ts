import { Reflector } from '@nestjs/core';

export const BoardRole = Reflector.createDecorator<('MODIFY' | 'VIEW')[]>();
