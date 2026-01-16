'use client';

import { useEffect, useState } from 'react';
import { builder } from '@/lib/builder';
import { BuilderComponent } from '@builder.io/react';
import '@/components/builder/registry'; // ensures components registered

export default function Page({ 
  params 
}: { 
  params: { page?: string[] } 
}) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const urlPath = '/' + (params.page?.join('/') || '');
  
  useEffect(() => {
    builder
      .get('page', {
        userAttributes: { urlPath }
      })
      .toPromise()
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [urlPath]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-zinc-600">Loading content...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
          <p className="text-zinc-400">This page does not exist in Builder.io</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      <BuilderComponent model="page" content={content} />
    </main>
  );
}
