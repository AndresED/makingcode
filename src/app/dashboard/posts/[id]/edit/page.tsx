import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostEditorForm } from '@/components/post-editor-form';
import { getPostByIdForAdmin } from '@/lib/posts/repository';

export const metadata: Metadata = {
  title: 'Edit post',
  robots: { index: false, follow: false },
};

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const post = await getPostByIdForAdmin(id);
  if (!post) notFound();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-ink">Edit post</h1>
      <PostEditorForm post={post} />
    </section>
  );
}
