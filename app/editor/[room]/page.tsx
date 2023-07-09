import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import NextDynamic from "next/dynamic";
import React from "react";
import { save } from "./save";
import { Loader2 } from "lucide-react";
import { notFound, useRouter } from "next/navigation";

const NoSSREditor = NextDynamic(() => import("@/app/editor/[room]/editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center mt-48">
      <Loader2 className="animate-spin w-8 h-8 text-gray-9" />
    </div>
  ),
});

const EditorPage = async ({
  params: { room },
}: {
  params: { room: string };
}) => {
  const session = await getServerSession(authOptions);

  const post = await db.post.findFirst({
    where: { id: room },
    select: { access: { where: { userId: session?.user.id } }, authorId: true },
  });

  if (!post || (post?.authorId != session?.user.id && !post.access)) {
    notFound();
  }

  return (
    <div className="px-6 w-full max-w-screen-md mx-auto mt-20">
      <NoSSREditor save={save} room={room} />
    </div>
  );
};
export default EditorPage;

export async function generateMetadata({ params: { room } }) {
  const post = await db.post.findUnique({ where: { id: room } });
  if (!post) {
    return;
  }
  return {
    title: `${post.title}`,
  };
}

export const revalidate = 0;
