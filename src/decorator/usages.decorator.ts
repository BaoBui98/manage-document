import { SetMetadata } from '@nestjs/common';

export const IS_USAGES_KEY = 'isUsages';
export const Usages = () => SetMetadata(IS_USAGES_KEY, true);
