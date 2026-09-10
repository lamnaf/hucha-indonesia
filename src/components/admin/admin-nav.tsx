import {
  BarChart3Icon,
  BellIcon,
  BriefcaseIcon,
  CircleUserRoundIcon,
  FileClockIcon,
  FileTextIcon,
  FolderTreeIcon,
  HelpCircleIcon,
  InboxIcon,
  LayoutDashboardIcon,
  MailIcon,
  MessageSquareQuoteIcon,
  PackageIcon,
  SearchIcon,
  SettingsIcon,
  TagsIcon,
  UserRoundCheckIcon,
} from "lucide-react";

import type { SidebarItem } from "@/components/layout/sidebar";

/**
 * Builds the admin sidebar navigation (blueprint §10). The admin panel has a
 * single role (Super Admin) with full access, so every module is always
 * listed.
 */
export function buildAdminNav(): SidebarItem[] {
  const groups: SidebarItem[] = [
    {
      id: "content",
      label: "Konten",
      icon: <FileTextIcon aria-hidden="true" />,
      children: [
        {
          id: "articles",
          label: "Artikel",
          href: "/admin/blog",
          icon: <FileTextIcon aria-hidden="true" />,
        },
        {
          id: "blog-categories",
          label: "Kategori Blog",
          href: "/admin/blog/categories",
          icon: <FolderTreeIcon aria-hidden="true" />,
        },
        {
          id: "tags",
          label: "Tag",
          href: "/admin/blog/tags",
          icon: <TagsIcon aria-hidden="true" />,
        },
        {
          id: "products",
          label: "Produk",
          href: "/admin/products",
          icon: <PackageIcon aria-hidden="true" />,
        },
        {
          id: "categories",
          label: "Kategori Produk",
          href: "/admin/categories",
          icon: <FolderTreeIcon aria-hidden="true" />,
        },
        {
          id: "brands",
          label: "Merek",
          href: "/admin/brands",
          icon: <TagsIcon aria-hidden="true" />,
        },
        {
          id: "testimonials",
          label: "Testimoni",
          href: "/admin/testimonials",
          icon: <MessageSquareQuoteIcon aria-hidden="true" />,
        },
        {
          id: "faq",
          label: "FAQ",
          href: "/admin/faq",
          icon: <HelpCircleIcon aria-hidden="true" />,
        },
        {
          id: "career",
          label: "Karir",
          href: "/admin/career",
          icon: <BriefcaseIcon aria-hidden="true" />,
        },
        {
          id: "applications",
          label: "Lamaran",
          href: "/admin/applications",
          icon: <UserRoundCheckIcon aria-hidden="true" />,
        },
      ],
    },
    {
      id: "leads",
      label: "Leads",
      icon: <InboxIcon aria-hidden="true" />,
      children: [
        {
          id: "leads-all",
          label: "Semua Leads",
          href: "/admin/leads",
          icon: <InboxIcon aria-hidden="true" />,
        },
        {
          id: "leads-contact",
          label: "Kontak",
          href: "/admin/leads?type=contact",
          icon: <MailIcon aria-hidden="true" />,
        },
        {
          id: "leads-distributor",
          label: "Distributor",
          href: "/admin/leads?type=distributor",
          icon: <PackageIcon aria-hidden="true" />,
        },
        {
          id: "leads-oem",
          label: "OEM",
          href: "/admin/leads?type=oem",
          icon: <BriefcaseIcon aria-hidden="true" />,
        },
        {
          id: "newsletter",
          label: "Newsletter",
          href: "/admin/newsletter",
          icon: <MailIcon aria-hidden="true" />,
        },
      ],
    },
    {
      id: "seo",
      label: "SEO",
      icon: <SearchIcon aria-hidden="true" />,
      children: [
        {
          id: "seo-manager",
          label: "SEO Management",
          href: "/admin/seo",
          icon: <SearchIcon aria-hidden="true" />,
        },
      ],
    },
    {
      id: "reports",
      label: "Laporan",
      icon: <BarChart3Icon aria-hidden="true" />,
      children: [
        {
          id: "analytics",
          label: "Analytics",
          href: "/admin/analytics",
          icon: <BarChart3Icon aria-hidden="true" />,
        },
      ],
    },
    {
      id: "settings",
      label: "Pengaturan",
      icon: <SettingsIcon aria-hidden="true" />,
      children: [
        {
          id: "settings-site",
          label: "Pengaturan Website",
          href: "/admin/settings",
          icon: <SettingsIcon aria-hidden="true" />,
        },
      ],
    },
    {
      id: "system",
      label: "Sistem",
      icon: <SettingsIcon aria-hidden="true" />,
      children: [
        {
          id: "audit-log",
          label: "Log Audit",
          href: "/admin/audit-log",
          icon: <FileClockIcon aria-hidden="true" />,
        },
        {
          id: "notifications",
          label: "Notifikasi",
          href: "/admin/notifications",
          icon: <BellIcon aria-hidden="true" />,
        },
        {
          id: "profile",
          label: "Profil Saya",
          href: "/admin/profil",
          icon: <CircleUserRoundIcon aria-hidden="true" />,
        },
      ],
    },
  ];

  return [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboardIcon aria-hidden="true" />,
    },
    ...groups,
  ];
}