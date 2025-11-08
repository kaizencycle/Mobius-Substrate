import { builder } from '@builder.io/sdk';

if (!process.env.NEXT_PUBLIC_BUILDER_API_KEY) {
  console.warn('NEXT_PUBLIC_BUILDER_API_KEY is missing');
}

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

export { builder };
