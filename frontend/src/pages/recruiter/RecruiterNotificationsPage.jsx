import { FiBell } from "react-icons/fi";
import { PageContainer } from "../../components/common/PageContainer";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { SkeletonLoader } from "../../components/feedback/SkeletonLoader";
import { GlassCard } from "../../components/ui/GlassCard";
import { useAsyncData } from "../../hooks/useAsyncData";
import { recruiterService } from "../../services/recruiterService";
import { formatRecruiterDateTime } from "../../utils/recruiterMetrics";

export function RecruiterNotificationsPage() {
  const notifications = useAsyncData(() => recruiterService.getNotifications({ limit: 50 }), []);

  return (
    <PageContainer eyebrow="Recruiter" title="Notifications" description="Company applicant, interview, and offer updates for your recruiter account.">
      {notifications.loading ? (
        <SkeletonLoader rows={6} />
      ) : notifications.error ? (
        <ErrorState description={notifications.error} />
      ) : notifications.data?.length ? (
        <div className="space-y-3">
          {notifications.data.map((notification) => (
            <GlassCard key={notification._id} className="p-4">
              <div className="flex gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">
                  <FiBell />
                </div>
                <div>
                  <h2 className="font-semibold text-white">{notification.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatRecruiterDateTime(notification.createdAt)}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState title="No notifications yet" description="Updates for your company pipeline will appear here." />
      )}
    </PageContainer>
  );
}
