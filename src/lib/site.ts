/**
 * Single source of truth for brand-wide facts that appear on many pages
 * (nav, footer, compliance blocks, WhatsApp links). Changing an office
 * address or a RERA number here updates every page that cites it —
 * avoids the "NAP must match character for character" trap the design
 * brief calls out for local SEO.
 */
export const SITE = {
  name: "AK Realtors Pvt. Ltd.",
  domain: "akarohanrealtors.com",
  tagline: "Premium property · since 2018",
  reraAgentNumber: "A041262504263",
  reraUrl: "https://maharera.maharashtra.gov.in",
  grievanceEmail: "privacy@akarohanrealtors.com",
  grievanceOfficer: "Anuj Mishra, Grievance Officer",
  consultants: [
    { name: "Anuj Mishra", phone: "919870886895", displayPhone: "98708 86895" },
    { name: "Rohan Chaturvedi", phone: "919359173171", displayPhone: "93591 73171" },
  ],
  offices: [
    {
      label: "Kharadi office",
      address:
        "Shop number B-112, Yashwin Orizzonte, near Panchshil Towers Rd, Vitthal Nagar, Kharadi, Pune, Maharashtra 411014",
    },
    {
      label: "Magarpatta office",
      address: "DATA SLOT — full Magarpatta address, exactly as it appears on its own Google Business Profile",
    },
  ],
  localities: ["Kharadi", "Upper Kharadi", "Wagholi", "Koregaon Park", "Magarpatta"],
} as const;

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects/" },
  { label: "Insights", href: "/insights/" },
] as const;
