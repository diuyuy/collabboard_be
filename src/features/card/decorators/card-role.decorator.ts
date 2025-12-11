import { Reflector } from '@nestjs/core';

export const CardRole = Reflector.createDecorator<('MODIFY' | 'VIEW')[]>();
