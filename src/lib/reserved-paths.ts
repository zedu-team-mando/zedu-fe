/**
 * Routes that are never organisation slugs, but do not live under (homepage).
 * Homepage segments are added from the app directory at startup.
 */
const NON_ORG_PATH_SEGMENTS = [
  "auth",
  "accept_org_invitation",
  "accept_general_invitation",
  "billing",
] as const;

const homepageRouteSegments = () =>
  (process.env.NEXT_PUBLIC_HOMEPAGE_ROUTE_SEGMENTS ?? "")
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

/** First URL segments that must not be treated as an organisation slug. */
export const RESERVED_PATH_SEGMENTS = new Set<string>([
  ...NON_ORG_PATH_SEGMENTS,
  ...homepageRouteSegments(),
]);

export const isReservedPathSegment = (segment?: string | null): boolean => {
  if (!segment) return false;
  return RESERVED_PATH_SEGMENTS.has(segment);
};

/** Org slug from a pathname, or "" when the first segment is a non-org route. */
export const orgSlugFromPathname = (pathname?: string | null): string => {
  const firstSegment = (pathname ?? "").split("/").filter(Boolean)[0] ?? "";
  if (!firstSegment || isReservedPathSegment(firstSegment)) return "";
  return firstSegment;
};
