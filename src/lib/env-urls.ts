function readEnv(name: string): string {
  return (process.env[name] ?? "").replace(/\/$/, "");
}

export function siteUrl(path = ""): string {
  const base = readEnv("NEXT_PUBLIC_CLIENT_URL");
  if (!path || path === "/") {
    return base;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ogImageUrl(fileName: string): string {
  return `${readEnv("NEXT_PUBLIC_MEDIA_URL")}/telexprodbucket/public/og-images/${fileName}`;
}

export function contactSalesUrl(): string {
  return `${readEnv("NEXT_PUBLIC_BASE_URL")}/contact`;
}

export function appStoreUrl(): string {
  return readEnv("NEXT_PUBLIC_APP_STORE_URL");
}

export function playStoreUrl(): string {
  return readEnv("NEXT_PUBLIC_PLAY_STORE_URL");
}

export function gtmScriptUrl(): string {
  return readEnv("NEXT_PUBLIC_GTM_SCRIPT_URL");
}

export function ipifyUrl(): string {
  return readEnv("NEXT_PUBLIC_IPIFY_URL");
}

export function ipapiUrl(): string {
  return readEnv("NEXT_PUBLIC_IPAPI_URL");
}

export function mediaBaseUrl(): string {
  return readEnv("NEXT_PUBLIC_MEDIA_URL");
}

export function mediaStagingBaseUrl(): string {
  return readEnv("NEXT_PUBLIC_MEDIA_STAGING_URL");
}

export function resolveMediaFileUrl(fileUrl: string): string | null {
  if (!fileUrl) return null;

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  const base = mediaBaseUrl() || mediaStagingBaseUrl();
  if (!base) return null;

  const path = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
  return `${base}${path}`;
}

export function isAllowedMediaFileUrl(fileUrl: string): boolean {
  try {
    const parsed = new URL(fileUrl);
    const allowedHosts = [mediaBaseUrl(), mediaStagingBaseUrl()]
      .filter(Boolean)
      .map((base) => new URL(base).hostname);

    return allowedHosts.includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function officeEmbedBaseUrl(): string {
  return readEnv("NEXT_PUBLIC_OFFICE_EMBED_URL");
}

export function officeEmbedUrl(fileUrl: string): string | null {
  const base = officeEmbedBaseUrl();
  if (!base || !fileUrl) return null;

  return `${base}?src=${encodeURIComponent(fileUrl)}`;
}

export function uiAvatarUrl(name: string): string {
  return `${readEnv("NEXT_PUBLIC_UI_AVATARS_URL")}?name=${encodeURIComponent(name)}`;
}

export const SOCIAL_URLS = {
  facebook:
    process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/zedu.chat",
  instagram:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/zedu.chat",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://tiktok.com/@zedu.chat",
  x: process.env.NEXT_PUBLIC_TWITTER_URL || "https://x.com/zedu.chat",
};

/** npm package root for emoji-datasource-apple (no trailing slash). */
export function appleEmojiDatasourceBaseUrl(): string {
  return readEnv("NEXT_PUBLIC_EMOJI_DATASOURCE_URL");
}

export function appleEmojiImageUrl(unified: string): string {
  const base = appleEmojiDatasourceBaseUrl();
  if (!base || !unified) return "";
  return `${base.replace(/\/$/, "")}/img/apple/64/${unified}.png`;
}
