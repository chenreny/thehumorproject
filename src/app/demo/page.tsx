import { connection } from "next/server";
import { notFound } from "next/navigation";
import { DemoRoom } from "@/components/demo-room";

export const metadata = { title: "Room playground · The Humor Project" };

export default async function DemoPage() {
  await connection();
  if (process.env.NODE_ENV !== "development") notFound();
  return <DemoRoom />;
}
