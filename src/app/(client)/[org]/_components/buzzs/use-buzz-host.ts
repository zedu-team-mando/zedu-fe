import { useContext, useEffect, useMemo, useState } from "react";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";

export type BuzzHost = {
  id?: string;
  user_id?: string;
  name?: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  default_avatar_url?: string;
};

// One request per host, shared by every buzz row that host started
const hostRequests = new Map<string, Promise<BuzzHost | null>>();

const fetchHost = (hostId: string) => {
  if (!hostRequests.has(hostId)) {
    const request = GetRequest(`/users/mentions/${hostId}`).then((res) => {
      if (res?.status !== 200 && res?.status !== 201) {
        // Allow a retry later instead of caching the failure
        hostRequests.delete(hostId);
        return null;
      }
      const user = res.data?.data;
      return {
        id: user?.userid || hostId,
        name: user?.display_name || user?.fullname,
        username: user?.username,
        avatar_url: user?.avatar_url,
        default_avatar_url: user?.default_avatar_url,
      };
    });
    hostRequests.set(hostId, request);
  }
  return hostRequests.get(hostId)!;
};

const findMember = (members: BuzzHost[] | null | undefined, id: string) =>
  members?.find((member) => member.id === id || member.user_id === id);

/**
 * Finds the buzz host among the loaded org members. orgMembers only holds the
 * first page (50), so fall back to the full mention list, then fetch the user.
 */
export const useBuzzHost = (hostId?: string) => {
  const { state } = useContext(DataContext);
  const { orgMembers, mentionOrgMembers } = state;
  const [fetchedHost, setFetchedHost] = useState<BuzzHost | null>(null);

  const memberHost = useMemo(
    () =>
      hostId
        ? findMember(mentionOrgMembers, hostId) ||
          findMember(orgMembers, hostId)
        : undefined,
    [hostId, mentionOrgMembers, orgMembers]
  );

  useEffect(() => {
    if (!hostId || memberHost) return;

    let cancelled = false;
    fetchHost(hostId).then((host) => {
      if (!cancelled) setFetchedHost(host);
    });
    return () => {
      cancelled = true;
    };
  }, [hostId, memberHost]);

  return memberHost || fetchedHost || undefined;
};
