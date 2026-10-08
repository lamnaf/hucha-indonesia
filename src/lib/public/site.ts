import { SettingRepository } from "@/domain/settings/setting.repository";
import { siteConfig as defaultConfig } from "@/lib/mock/site";

export interface PublicSiteConfig {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  whatsappDisplay: string;
  hours: string;
  social: {
    instagram: string;
    tiktok: string;
    whatsapp: string;
  };
  mapEmbedUrl: string;
  /** Media asset paths resolved from settings (media library). */
  media: {
    logo: string;
    favicon: string;
  };
  /** Third-party analytics/tag-manager account IDs. */
  analytics: {
    googleAnalyticsId: string;
    googleTagManagerId: string;
  };
  /** Official marketplace links for footer display. */
  marketplaces: {
    shopee: string;
    tokopedia: string;
    tiktokShop: string;
  };
}

function unwrapSetting(value: unknown): Record<string, string> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, string>)
    : null;
}

/**
 * Company + social contact info, sourced from the `company` and `social`
 * settings (admin-editable) and falling back to the static brand defaults so
 * the public site never renders empty contact fields.
 */
export async function getSiteConfig(): Promise<PublicSiteConfig> {
  let companyRaw: unknown = null;
  let socialRaw: unknown = null;
  let mediaRaw: unknown = null;
  let analyticsRaw: unknown = null;
  let marketplacesRaw: unknown = null;

  try {
    const settings = new SettingRepository();
    [companyRaw, socialRaw, mediaRaw, analyticsRaw, marketplacesRaw] = await Promise.all([
      settings.get("company"),
      settings.get("social"),
      settings.get("media"),
      settings.get("analytics"),
      settings.get("marketplaces"),
    ]);
  } catch {
    // DB unreachable (e.g. during build on Vercel) — use defaults.
  }

  const company = unwrapSetting(companyRaw);
  const social = unwrapSetting(socialRaw);
  const media = unwrapSetting(mediaRaw);
  const analytics = unwrapSetting(analyticsRaw);
  const marketplaces = unwrapSetting(marketplacesRaw);
  const whatsapp = company?.whatsapp ?? defaultConfig.whatsapp;

  return {
    name: company?.name ?? defaultConfig.name,
    legalName: company?.legalName ?? defaultConfig.legalName,
    tagline: defaultConfig.tagline,
    description: defaultConfig.description,
    address: company?.address ?? defaultConfig.address,
    phone: company?.phone ?? defaultConfig.phone,
    email: company?.email ?? defaultConfig.email,
    whatsapp,
    whatsappDisplay: whatsapp.replace(/^\+/, ""),
    hours: defaultConfig.hours,
    social: {
      instagram: social?.instagram ?? defaultConfig.social.instagram,
      tiktok: social?.tiktok ?? defaultConfig.social.tiktok,
      whatsapp: social?.whatsapp ?? defaultConfig.social.whatsapp,
    },
    mapEmbedUrl: defaultConfig.mapEmbedUrl,
    media: {
      logo: media?.logo ?? "",
      favicon: media?.favicon ?? "",
    },
    analytics: {
      googleAnalyticsId: analytics?.googleAnalyticsId ?? "",
      googleTagManagerId: analytics?.googleTagManagerId ?? "",
    },
    marketplaces: {
      shopee: marketplaces?.shopee ?? "",
      tokopedia: marketplaces?.tokopedia ?? "",
      tiktokShop: marketplaces?.tiktokShop ?? "",
    },
  };
}