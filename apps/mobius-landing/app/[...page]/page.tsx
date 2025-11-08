import { builder } from '@/lib/builder';
import { BuilderComponent } from '@builder.io/react';
import { notFound } from 'next/navigation';
import '@/components/builder/registry'; // ensures components registered

export const revalidate = 60; // ISR: 60s

export default async function Page({ 
  params 
}: { 
  params: { page?: string[] } 
}) {
  const urlPath = '/' + (params.page?.join('/') || '');
  
  const content = await builder
    .get('page', {
      userAttributes: { urlPath }
    })
    .toPromise();

  if (!content) {
    return notFound();
  }

  return (
    <main>
      <BuilderComponent model="page" content={content} />
    </main>
  );
}
