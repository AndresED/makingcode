import type { Metadata } from 'next';
import { PostEditorForm } from '@/components/post-editor-form';

export const metadata: Metadata = {
  title: 'New post',
  robots: { index: false, follow: false },
};

export default function NewPostPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-ink">New post</h1>
      <PostEditorForm />
    </section>
  );
}
