import { Reflector } from '@nestjs/core';

export const ListRole = Reflector.createDecorator<('MODIFY' | 'VIEW')[]>();
