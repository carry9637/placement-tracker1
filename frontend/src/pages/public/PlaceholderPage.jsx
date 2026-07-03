import { FiPlus } from "react-icons/fi";
import { Button } from "../../components/ui/Button";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { GlassCard } from "../../components/ui/GlassCard";

export function PlaceholderPage({ title, role }) {
  return (
    <PageContainer
      eyebrow={`${role} workspace`}
      title={title}
      description="This responsive foundation page is ready for API-backed lists, filters, forms, and workflows."
      actions={<Button icon={FiPlus}>New item</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <EmptyState title={`${title} data will appear here`} description="Dummy UI only. No backend connection has been made in this module." />
        <GlassCard>
          <p className="text-sm font-semibold text-white">Foundation checklist</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>Responsive container</li>
            <li>Role-aware navigation</li>
            <li>Reusable empty and error states</li>
            <li>Ready for tables, filters, and modals</li>
          </ul>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
