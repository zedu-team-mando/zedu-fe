import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useDebounce } from "use-debounce";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { GetRequest } from "~/utils/new-request";

const PAGE_LIMIT = 50;
const SEARCH_DEBOUNCE_MS = 2000;

type OrgUsersPagination = {
  loadedPage: number;
  hasMore: boolean;
  totalItems: number;
};

const paginationByOrgId = new Map<string, OrgUsersPagination>();
const inflightPagesByOrgId = new Map<string, Set<number>>();
const mentionLoadedByOrgId = new Set<string>();

const getOrgPagination = (orgId: string): OrgUsersPagination => {
  if (!paginationByOrgId.has(orgId)) {
    paginationByOrgId.set(orgId, {
      loadedPage: 0,
      hasMore: true,
      totalItems: 0,
    });
  }
  return paginationByOrgId.get(orgId)!;
};

const resetOrgPagination = (orgId: string) => {
  paginationByOrgId.set(orgId, {
    loadedPage: 0,
    hasMore: true,
    totalItems: 0,
  });
  inflightPagesByOrgId.delete(orgId);
  mentionLoadedByOrgId.delete(orgId);
};

const getInflightPages = (orgId: string) => {
  if (!inflightPagesByOrgId.has(orgId)) {
    inflightPagesByOrgId.set(orgId, new Set());
  }
  return inflightPagesByOrgId.get(orgId)!;
};

const memberKey = (member: {
  id?: string | number;
  user_id?: string | number;
}) => String(member.id ?? member.user_id ?? "");

const mergeOrgMembers = (existing: unknown[], incoming: unknown[]) => {
  const seen = new Set<string>();
  const merged: unknown[] = [];

  for (const member of [...existing, ...incoming]) {
    const key = memberKey(
      member as { id?: string | number; user_id?: string | number }
    );
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(member);
  }

  return merged;
};

const normalizePagination = (raw: unknown) => {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  if (typeof raw === "object") {
    return raw as {
      current_page?: number;
      total_pages?: number;
      total_items?: number;
      page_size?: number;
    };
  }
  return null;
};

const buildUsersUrl = (orgId: string, pageNumber: number, search?: string) => {
  const params = new URLSearchParams({
    page: String(pageNumber),
    limit: String(PAGE_LIMIT),
  });
  const trimmed = search?.trim();
  if (trimmed) params.set("search", trimmed);
  return `/organisations/${orgId}/users?${params.toString()}`;
};

type UseOrganisationUsersOptions = {
  /** When false, skips automatic fetch (e.g. modal closed). Default true. */
  enabled?: boolean;
  /** Backend search term (name, email, or username). */
  search?: string;
};

export const useOrganisationUsers = (
  orgId: string,
  options?: UseOrganisationUsersOptions
) => {
  const enabled = options?.enabled !== false;
  const searchTerm = options?.search ?? "";
  const [debouncedSearch] = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);
  const trimmedSearch = searchTerm.trim();
  const trimmedDebounced = debouncedSearch.trim();
  const hasSearchInput = trimmedSearch.length > 0;
  const isSearching = trimmedDebounced.length > 0;
  // True from the first keystroke until the debounced value catches up
  const isDebouncing = trimmedSearch !== trimmedDebounced;

  const { state, dispatch } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Local search results — must not replace the global browse list
  const [searchUsers, setSearchUsers] = useState<unknown[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchTotalItems, setSearchTotalItems] = useState(0);
  const searchPageRef = useRef(0);
  const searchInflightRef = useRef<Set<number>>(new Set());
  // Bumped whenever the query, org or enabled state changes so responses that
  // belong to a superseded search can be ignored instead of overwriting results
  const searchGenerationRef = useRef(0);

  const orgMembersRef = useRef(state.orgMembers);
  const prevOrgIdRef = useRef(orgId);
  const prevOrgCallbackRef = useRef(state.orgCallback);

  useEffect(() => {
    orgMembersRef.current = state.orgMembers;
  }, [state.orgMembers]);

  const fetchBrowseUsers = useCallback(
    async (pageNumber: number, isInitial: boolean) => {
      if (!orgId) return;

      const inflight = getInflightPages(orgId);
      if (inflight.has(pageNumber)) return;

      inflight.add(pageNumber);
      setLoading(true);

      try {
        const response = await GetRequest(buildUsersUrl(orgId, pageNumber));

        if (response?.status === 200 || response?.status === 201) {
          const newUsers = response?.data?.data || [];
          const pagination = normalizePagination(response?.data?.pagination);
          const orgPagination = getOrgPagination(orgId);

          orgPagination.loadedPage = Math.max(
            orgPagination.loadedPage,
            pageNumber
          );

          if (pagination) {
            const currentPage = pagination.current_page ?? pageNumber;
            const totalPages = pagination.total_pages ?? 1;
            orgPagination.hasMore = currentPage < totalPages;
            orgPagination.totalItems =
              pagination.total_items ?? orgPagination.totalItems;
          } else {
            orgPagination.hasMore = newUsers.length >= PAGE_LIMIT;
          }

          setHasMore(orgPagination.hasMore);
          setTotalItems(orgPagination.totalItems);

          const base = isInitial ? [] : orgMembersRef.current || [];
          dispatch({
            type: ACTIONS.ORG_MEMBERS,
            payload: mergeOrgMembers(base, newUsers),
          });
          dispatch({
            type: ACTIONS.ORG_MEMBERS_TOTAL,
            payload: orgPagination.totalItems,
          });

          // Load full member list once for fast client-side @mentions
          if (
            orgPagination.totalItems > 0 &&
            !mentionLoadedByOrgId.has(orgId)
          ) {
            mentionLoadedByOrgId.add(orgId);
            GetRequest(
              `/organisations/${orgId}/users?page=1&limit=${orgPagination.totalItems}`
            ).then((allRes) => {
              if (allRes?.status === 200 || allRes?.status === 201) {
                dispatch({
                  type: ACTIONS.MENTION_ORG_MEMBERS,
                  payload: allRes?.data?.data || [],
                });
              }
            });
          }
        }
      } finally {
        inflight.delete(pageNumber);
        setLoading(false);
      }
    },
    [orgId, dispatch]
  );

  const fetchSearchUsers = useCallback(
    async (pageNumber: number, isInitial: boolean, query: string) => {
      if (!orgId || !query.trim()) return;
      if (searchInflightRef.current.has(pageNumber)) return;

      const generation = searchGenerationRef.current;
      searchInflightRef.current.add(pageNumber);
      setSearchLoading(true);

      try {
        const response = await GetRequest(
          buildUsersUrl(orgId, pageNumber, query)
        );

        // A newer query/org superseded this request while it was in flight
        if (generation !== searchGenerationRef.current) return;

        if (response?.status === 200 || response?.status === 201) {
          const newUsers = response?.data?.data || [];
          const pagination = normalizePagination(response?.data?.pagination);

          searchPageRef.current = Math.max(searchPageRef.current, pageNumber);

          if (pagination) {
            const currentPage = pagination.current_page ?? pageNumber;
            const totalPages = pagination.total_pages ?? 1;
            setSearchHasMore(currentPage < totalPages);
            setSearchTotalItems(pagination.total_items ?? newUsers.length);
          } else {
            setSearchHasMore(newUsers.length >= PAGE_LIMIT);
            setSearchTotalItems((prev) =>
              isInitial ? newUsers.length : prev + newUsers.length
            );
          }

          setSearchUsers((prev) =>
            isInitial ? newUsers : mergeOrgMembers(prev, newUsers)
          );
        }
      } finally {
        // Only the current generation may clear the in-flight marker and the
        // loader; a stale response must not unlock a newer request for the
        // same page or hide its loading state
        if (generation === searchGenerationRef.current) {
          searchInflightRef.current.delete(pageNumber);
          setSearchLoading(false);
        }
      }
    },
    [orgId]
  );

  // Browse mode: initial load / org change / orgCallback refresh
  useEffect(() => {
    if (!enabled || !orgId || isSearching) return;

    const orgIdChanged = prevOrgIdRef.current !== orgId;
    const orgCallbackChanged = prevOrgCallbackRef.current !== state.orgCallback;

    prevOrgIdRef.current = orgId;
    prevOrgCallbackRef.current = state.orgCallback;

    if (orgIdChanged || orgCallbackChanged) {
      resetOrgPagination(orgId);
      setHasMore(true);
      setTotalItems(0);
      dispatch({ type: ACTIONS.MENTION_ORG_MEMBERS, payload: null });
      fetchBrowseUsers(1, true);
      return;
    }

    const orgPagination = getOrgPagination(orgId);
    setHasMore(orgPagination.hasMore);
    setTotalItems(orgPagination.totalItems);

    if (orgPagination.loadedPage === 0) {
      fetchBrowseUsers(1, true);
    }
  }, [orgId, enabled, isSearching, fetchBrowseUsers, state.orgCallback]);

  // Search mode: refetch when debounced query changes
  useEffect(() => {
    searchGenerationRef.current += 1;

    if (!enabled || !orgId) {
      setSearchLoading(false);
      return;
    }

    if (!isSearching) {
      setSearchLoading(false);
      setSearchUsers([]);
      setSearchHasMore(false);
      setSearchTotalItems(0);
      searchPageRef.current = 0;
      searchInflightRef.current.clear();
      return;
    }

    searchPageRef.current = 0;
    searchInflightRef.current.clear();
    setSearchUsers([]);
    setSearchHasMore(true);
    setSearchTotalItems(0);
    fetchSearchUsers(1, true, debouncedSearch.trim());
  }, [orgId, enabled, isSearching, debouncedSearch, fetchSearchUsers]);

  const loadMore = useCallback(() => {
    if (!orgId) return;

    if (isSearching) {
      if (searchLoading || !searchHasMore || isDebouncing) return;
      const nextPage = searchPageRef.current + 1;
      fetchSearchUsers(nextPage, false, debouncedSearch.trim());
      return;
    }

    if (loading) return;
    const orgPagination = getOrgPagination(orgId);
    if (!orgPagination.hasMore) return;
    fetchBrowseUsers(orgPagination.loadedPage + 1, false);
  }, [
    orgId,
    isSearching,
    isDebouncing,
    searchLoading,
    searchHasMore,
    debouncedSearch,
    fetchSearchUsers,
    loading,
    fetchBrowseUsers,
  ]);

  // While typing (debounce pending), clear results so UIs show the loader immediately
  const users = hasSearchInput
    ? isDebouncing
      ? []
      : searchUsers
    : (state.orgMembers ?? []);

  return {
    loading: hasSearchInput ? isDebouncing || searchLoading : loading,
    hasMore: isSearching && !isDebouncing ? searchHasMore : hasMore,
    loadMore,
    totalItems: isSearching && !isDebouncing ? searchTotalItems : totalItems,
    users,
    isSearching: hasSearchInput,
  };
};
