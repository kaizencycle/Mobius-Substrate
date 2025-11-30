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
    return <div>Loading...</div>;
  }

  if (!content) {
    return <div>Page not found</div>;
  }

  return (
    <main>
      <BuilderComponent model="page" content={content} />
    </main>
  );
}
