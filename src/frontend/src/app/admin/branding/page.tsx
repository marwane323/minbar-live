import { PageShell } from "@/components/layout/page-shell";
import { BrandingEditor } from "@/components/admin/branding-editor";

export default function AdminBrandingPage() {
  return (
    <PageShell 
      title="Branding & Appearance" 
      description="Customize the listener portal with your mosque's identity."
    >
      <BrandingEditor />
    </PageShell>
  );
}
