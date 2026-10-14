import { orgSlugFromPathname } from "~/lib/reserved-paths";

const getString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const mergeNestedObject = (
  base: Record<string, unknown>,
  nested: unknown
): Record<string, unknown> => {
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return { ...base, ...(nested as Record<string, unknown>) };
  }

  if (typeof nested === "string") {
    try {
      const parsed = JSON.parse(nested) as Record<string, unknown>;
      return { ...base, ...parsed };
    } catch {
      return base;
    }
  }

  return base;
};

export const normalizeNotificationPayload = (
  raw: Record<string, unknown> = {}
): Record<string, unknown> => {
  let data = { ...raw };

  // OneSignal / Centrifugo payloads often nest IDs under payload or data
  data = mergeNestedObject(data, raw.payload);
  data = mergeNestedObject(data, raw.data);
  data = mergeNestedObject(data, data.payload);
  data = mergeNestedObject(data, data.data);

  return data;
};

export const normalizeInternalPath = (value?: string | null): string | null => {
  if (!value) return null;

  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      const parsed = new URL(value);
      if (
        typeof window !== "undefined" &&
        parsed.origin !== window.location.origin
      ) {
        window.open(value, "_blank", "noopener,noreferrer");
        return null;
      }
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    // fall through
  }

  return value.startsWith("/") ? value : `/${value}`;
};

/** Generic OneSignal launch URLs that are not real message destinations. */
const isShallowHomeRoute = (path: string | null, orgSlug: string): boolean => {
  if (!path) return true;

  const pathname = (path.split("?")[0] || "/").replace(/\/$/, "") || "/";
  if (pathname === "/") return true;
  if (!orgSlug) return false;

  return (
    pathname === `/${orgSlug}` ||
    pathname === `/${orgSlug}/home` ||
    pathname === `/${orgSlug}/home/channels`
  );
};

/** True when the path already targets a conversation / buzz / message. */
const isMeaningfulDeepLink = (path: string | null): boolean => {
  if (!path) return false;
  if (/[?&](thread_id|message_id)=/.test(path)) return true;
  return /\/(home\/channels|dm|dms|buzz|people)\//.test(path.split("?")[0]);
};

const appendMessageDeepLink = (
  basePath: string,
  data: Record<string, unknown>
): string => {
  if (/[?&](thread_id|message_id)=/.test(basePath)) return basePath;

  const threadId = getString(data.thread_id);
  const messageId = getString(data.message_id) || getString(data.messages_id);

  // Match search navigation: use message id as thread_id when thread is absent
  const deepThreadId = threadId || messageId;
  if (!deepThreadId) return basePath;

  const params = new URLSearchParams();
  params.set("thread_id", deepThreadId);
  if (messageId && threadId && messageId !== threadId) {
    params.set("message_id", messageId);
  }

  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}${params.toString()}`;
};

export const getOrgSlugForNotification = (payloadOrgId?: unknown): string => {
  if (typeof window === "undefined") return "";

  const pathSlug = orgSlugFromPathname(window.location.pathname);
  if (pathSlug) return pathSlug;

  const storedSlug = localStorage.getItem("orgSlug");
  if (storedSlug) return storedSlug;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.current_organisation_slug) return user.current_organisation_slug;

    if (Array.isArray(user?.organisations) && payloadOrgId) {
      const org = user.organisations.find(
        (item: { id?: string | number; slug?: string }) =>
          String(item?.id) === String(payloadOrgId)
      );
      if (org?.slug) return org.slug;
    }
  } catch {
    // ignore JSON parse failures
  }

  return "";
};

export const resolveNotificationRoute = (
  rawPayload: Record<string, unknown> = {},
  launchURL?: string | null,
  orgSlugOverride?: string | null
): string | null => {
  const data = normalizeNotificationPayload(rawPayload);
  const orgSlug =
    orgSlugOverride ||
    getString(data.org_slug) ||
    getOrgSlugForNotification(data.org_id);

  const directRoute =
    normalizeInternalPath(getString(data.route)) ||
    normalizeInternalPath(getString(data.path)) ||
    normalizeInternalPath(getString(data.url)) ||
    normalizeInternalPath(getString(data.redirect_url)) ||
    normalizeInternalPath(launchURL);

  // Prefer an already-complete deep link from the payload/launch URL
  if (directRoute && isMeaningfulDeepLink(directRoute)) {
    return directRoute;
  }

  const channelId = getString(data.channel_id) || getString(data.channels_id);
  const participantId =
    getString(data.participant_id) || getString(data.sender_id);
  const notificationType = (
    getString(data.notification_type) || ""
  ).toLowerCase();
  const event = (getString(data.event) || "").toLowerCase();
  const section = (getString(data.section) || "").toLowerCase();
  const channelType = (getString(data.channel_type) || "")
    .toLowerCase()
    .replace(/[\s_-]/g, "");
  const buzzId = getString(data.buzz_id);

  if (!orgSlug) {
    // No org context — only use non-homepage direct routes
    if (directRoute && !isShallowHomeRoute(directRoute, "")) {
      return directRoute;
    }
    return null;
  }

  const isGroupDm =
    notificationType === "groupdm" ||
    channelType === "groupdm" ||
    channelType === "groupdms";

  const isDmNotification =
    notificationType === "dm" ||
    section === "dm_channels_section" ||
    channelType === "dm" ||
    isGroupDm;

  const dmRoute = () => {
    if (!channelId) return null;
    if (isGroupDm || !participantId) {
      return `/${orgSlug}/dm/${channelId}/dms`;
    }
    return `/${orgSlug}/dm/${channelId}/${participantId}`;
  };

  const channelRoute = () => {
    if (!channelId) return null;
    return `/${orgSlug}/home/channels/${channelId}`;
  };

  const finalize = (route: string | null) => {
    if (!route) return null;
    return appendMessageDeepLink(route, data);
  };

  if (isDmNotification && channelId) {
    return finalize(dmRoute() || `/${orgSlug}/notifications`);
  }

  if (section === "dm_channels_section" && channelId) {
    return finalize(dmRoute() || `/${orgSlug}/notifications`);
  }

  if (
    section === "thread_message" &&
    (event === "new_message" || notificationType === "new_message") &&
    channelId
  ) {
    return finalize(channelRoute() || `/${orgSlug}/notifications`);
  }

  if (section === "channels_section" && channelId) {
    return finalize(channelRoute() || `/${orgSlug}/notifications`);
  }

  if (notificationType === "channel" && channelId) {
    return finalize(channelRoute() || `/${orgSlug}/notifications`);
  }

  if (
    notificationType === "direct_call_initialized" ||
    notificationType === "direct_call_initiated" ||
    notificationType === "direct_call_response"
  ) {
    if (buzzId) return `/${orgSlug}/buzz/${buzzId}`;
    return finalize(dmRoute() || `/${orgSlug}/notifications`);
  }

  if (notificationType?.includes("buzz") && buzzId) {
    return `/${orgSlug}/buzz/${buzzId}`;
  }

  if (
    (event === "new_message" ||
      notificationType === "new_message" ||
      notificationType === "mention") &&
    channelId
  ) {
    return finalize(
      isDmNotification
        ? dmRoute() || `/${orgSlug}/notifications`
        : channelRoute() || `/${orgSlug}/notifications`
    );
  }

  if (channelId) {
    return finalize(channelRoute() || `/${orgSlug}/notifications`);
  }

  // No channel ids — use launch URL only if it is not a bare homepage
  if (directRoute && !isShallowHomeRoute(directRoute, orgSlug)) {
    return directRoute;
  }

  return `/${orgSlug}/notifications`;
};

export const storeMessageHighlightId = (
  rawPayload: Record<string, unknown> = {}
) => {
  if (typeof window === "undefined") return;

  const data = normalizeNotificationPayload(rawPayload);
  const messageId =
    getString(data.message_id) ||
    getString(data.messages_id) ||
    getString(data.thread_id);

  if (messageId) {
    localStorage.setItem("data-id", messageId);
  }
};
