"use client";

import { useRouter } from "next/navigation";
import { useServiceEngineSession } from "./ServiceEngineSession";

export default function EngineNavigationLink() {
  const router = useRouter();
  const { reset } = useServiceEngineSession();
  return <button className="nav-link-button" type="button" onClick={() => {
    reset();
    router.push("/engine");
  }}>Engine</button>;
}
