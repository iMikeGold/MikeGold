import "server-only";

import { publicHats } from "@/system/generated/public-hats.generated";
import { publicProjects } from "@/system/generated/public-projects.generated";
import { publicWork } from "@/system/generated/public-work.generated";
import { analyseServiceIntent, presentationLabel } from "@/system/services/intent-engine";
import type { PublicServiceProject, PublicServiceResult } from "@/system/services/public-service.types";

const hatBySlug = new Map(publicHats.map((hat) => [hat.slug, hat]));
const projectBySlug = new Map(publicProjects.map((project) => [project.slug, project]));
const workBySlug = new Map(publicWork.map((work) => [work.slug, work]));

export function analysePublicService(query: string): PublicServiceResult {
  const analysis = analyseServiceIntent(publicHats, publicWork, query);
  const grouped = new Map<string, typeof analysis.relevantWork>();
  for (const match of analysis.relevantWork) {
    grouped.set(match.projectSlug, [...(grouped.get(match.projectSlug) ?? []), match]);
  }

  const projects: PublicServiceProject[] = [...grouped.entries()]
    .map(([projectSlug, matches]) => {
      const ordered = [...matches].sort((a, b) => b.score - a.score || a.workSlug.localeCompare(b.workSlug));
      const strongest = ordered[0];
      const headlineWork = workBySlug.get(strongest.workSlug);
      return {
        projectSlug,
        name: projectBySlug.get(projectSlug)?.name ?? projectSlug,
        connectionLabel: presentationLabel[strongest.presentationClass],
        headline: headlineWork?.title ?? strongest.generatedSummary,
        summary: strongest.generatedSummary,
        additionalContributions: ordered.slice(1).map((match) => ({
          title: workBySlug.get(match.workSlug)?.title ?? match.generatedSummary,
          summary: match.generatedSummary,
        })),
        score: strongest.score,
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 5)
    .map(({ score: _score, ...project }) => project);

  return {
    status: analysis.publicStatus,
    understood: { title: analysis.title, summary: analysis.summary },
    route: {
      concepts: analysis.interpretedIntent.concepts.map((concept) => concept.label),
      unresolvedTerms: analysis.interpretedIntent.unresolvedTerms,
      objective: analysis.scope.objective || undefined,
    },
    capabilities: analysis.capabilityConfiguration.slice(0, 7).map((capability) => ({
      hatSlug: capability.slug,
      name: hatBySlug.get(capability.slug)?.name ?? capability.slug,
      role: capability.role,
      state: capability.evidenced ? "previously-applied" : "configured-recommendation",
      reason: capability.reasons.join(" "),
    })),
    projects,
    refinement: analysis.interpretedIntent.ambiguities[0],
  };
}
