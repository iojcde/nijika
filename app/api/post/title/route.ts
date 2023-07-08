import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";

const Title = async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { title, room } = await req.json();

  await db.post.update({ where: { id: room }, data: { title } });
  // revalidateTag("posts");
  return new Response("OK", { status: 200 });
};

export { Title as POST };
