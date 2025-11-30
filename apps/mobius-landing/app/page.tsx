'use client';

import { useEffect, useState } from 'react';
import { builder } from '@/lib/builder';
import { BuilderComponent } from '@builder.io/react';
import '@/components/builder/registry'; // ensures components registered

export default function Home() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    builder
      .get('page', {
        userAttributes: {
          urlPath: '/',
        },
      })
      .toPromise()
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center p-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Create a page in Builder.io</h1>
          <p className="text-zinc-400">
            Create a &quot;page&quot; model in Builder.io and set the URL path to &quot;/&quot;
          </p>
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
