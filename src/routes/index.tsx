import { createFileRoute } from "@tanstack/react-router";
import { CrtApp } from "@/components/crt/CrtApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <CrtApp />;
}
