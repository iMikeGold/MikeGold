"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CAPABILITY_GROUPS, type CapabilityGroupId } from "@/system/work/capability-groups";

export default function ProjectContextBackLink() {
  const [area, setArea] = useState<CapabilityGroupId | "">("");

  useEffect(() => {
    const requestedArea = new URLSearchParams(window.location.search).get("area");
    if (CAPABILITY_GROUPS.some((group) => group.id === requestedArea)) {
      setArea(requestedArea as CapabilityGroupId);
    }
  }, []);

  const group = CAPABILITY_GROUPS.find((candidate) => candidate.id === area);
  return (
    <Link className="record-back-link" href={area ? `/projects?area=${area}` : "/projects"}>
      ← {group ? `Back to ${group.name}` : "All work"}
    </Link>
  );
}
