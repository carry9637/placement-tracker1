import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiBriefcase,
  FiCalendar,
  FiChevronDown,
  FiClipboard,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiShield,
  FiTarget,
} from "react-icons/fi";
import heroImage from "../../assets/hero.png";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { theme } from "../../config/theme";

const features = [
  ["Role-based placement workflows", "Dedicated journeys for students, mentors, recruiters, and administrators.", FiShield],
  ["Application pipeline tracking", "Track every candidate from application through offer response with clear ownership.", FiClipboard],
  ["Mentor readiness support", "Resume reviews, notes, recommendations, and guidance activity stay connected to placement outcomes.", FiTarget],
  ["Recruiter interview operations", "Company recruiters can manage interviews, feedback, decisions, and offers for their own candidates.", FiBriefcase],
  ["Placement drive management", "Organize jobs by drives, eligibility, deadlines, rounds, and company participation.", FiCalendar],
  ["Reports and analytics", "Monitor applications, companies, interviews, offers, and placement progress from one system.", FiBarChart2],
];

const statistics = [
  ["2,400+", "student profiles managed"],
  ["180+", "hiring drives coordinated"],
  ["320+", "company opportunities tracked"],
  ["91%", "placement workflow visibility"],
];

const companies = ["TCS", "Infosys", "Accenture", "Amazon", "Microsoft", "Deloitte", "Capgemini", "Wipro"];

const process = [
  ["Apply", "Students discover eligible jobs and submit applications."],
  ["Screen", "Placement admins verify eligibility, documents, and mentor readiness."],
  ["Guide", "Mentors support preparation and add recommendations."],
  ["Shortlist", "Admins forward qualified candidates to company recruiters."],
  ["Interview", "Recruiters schedule rounds, add feedback, and progress decisions."],
  ["Offer", "Selected students receive, accept, or decline offers."],
];

const stories = [
  {
    name: "Isha Raman",
    role: "Software Engineer, product company",
    quote: "PlacementOS gave me one clear view of jobs, mentor feedback, interviews, and offer updates.",
  },
  {
    name: "Arjun Mehta",
    role: "Graduate Trainee, enterprise services",
    quote: "The readiness journey helped me improve my resume before my recruiter interview rounds began.",
  },
  {
    name: "Neha S.",
    role: "Data Analyst, consulting firm",
    quote: "Status updates were transparent, and I always knew what action was expected next.",
  },
];

const faqs = [
  ["Who is PlacementOS for?", "PlacementOS is built for colleges and training teams managing students, mentors, recruiters, placement drives, and campus hiring workflows."],
  ["Can recruiters see every candidate?", "No. Recruiters are scoped to their assigned company and only work with candidates connected to that company pipeline."],
  ["Does PlacementOS support mentor guidance?", "Yes. Mentors can review assigned students, add notes, conduct guidance sessions, and recommend students without taking over recruiter decisions."],
  ["Can students track offers?", "Yes. Students can view application status updates and respond to released offers with accept or decline actions."],
];

const SectionHeader = ({ eyebrow, title, description }) => (
  <div className="mx-auto mb-10 max-w-3xl text-center">
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</p>
    <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
    {description ? <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">{description}</p> : null}
  </div>
);

export function LandingPage() {
  return (
    <main className="relative overflow-hidden bg-slate-950 text-white">
      <section className="relative min-h-[82svh] overflow-hidden">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-28" />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.18),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.25),#020617_94%)]" />
        <div className="relative mx-auto flex min-h-[82svh] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <motion.div className="max-w-4xl" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs text-cyan-100 backdrop-blur-xl">
              <FiAward />
              Campus placement management platform
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">{theme.appName}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              A unified placement operating system for colleges to manage students, mentors, recruiters, companies, drives, interviews, offers, reports, and outcomes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/login">
                <Button icon={FiArrowRight}>Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary">Create student account</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">About PlacementOS</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Built for modern campus hiring teams.</h2>
          </div>
          <p className="text-sm leading-7 text-slate-400 sm:text-base">
            PlacementOS brings institutional placement workflows into one accountable system. Admins manage drives and screening,
            mentors guide readiness, recruiters run company interviews, and students follow their placement journey without scattered updates.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Key features" title="Everything campus placement teams need" description="Designed around real ownership across student, admin, mentor, and recruiter workflows." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map(([title, description, Icon]) => (
            <GlassCard key={title} hover className="p-5">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200">
                <Icon />
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.035] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-6 text-center">
              <p className="text-3xl font-semibold text-white">{value}</p>
              <p className="mt-2 text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Hiring network" title="Top hiring companies" description="Coordinate campus opportunities across services, product, consulting, and technology recruiters." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {companies.map((company) => (
            <GlassCard key={company} hover className="flex min-h-28 items-center justify-center p-5">
              <div className="text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-sm font-semibold text-cyan-100 ring-1 ring-white/10">
                  {company.slice(0, 2).toUpperCase()}
                </div>
                <p className="font-semibold text-white">{company}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Placement process" title="From application to accepted offer" description="A clear timeline keeps every stakeholder responsible for the right stage." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {process.map(([title, description], index) => (
            <GlassCard key={title} className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/10 text-sm font-semibold text-cyan-200">{index + 1}</span>
                <h3 className="font-semibold text-white">{title}</h3>
              </div>
              <p className="text-sm leading-6 text-slate-400">{description}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Student stories" title="Success with clearer placement journeys" description="Students get better visibility, preparation context, and timely hiring updates." />
        <div className="grid gap-4 lg:grid-cols-3">
          {stories.map((story) => (
            <GlassCard key={story.name} hover className="p-5">
              <FiMessageSquare className="mb-4 text-cyan-200" />
              <p className="text-sm leading-6 text-slate-300">"{story.quote}"</p>
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="font-semibold text-white">{story.name}</p>
                <p className="mt-1 text-xs text-slate-500">{story.role}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Questions colleges ask before going live" />
        <div className="space-y-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group rounded-2xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
                {question}
                <FiChevronDown className="shrink-0 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-400">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <GlassCard className="p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Contact</p>
              <h2 className="text-3xl font-semibold text-white">Bring placement operations into one trusted system.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                Connect your placement cell, departments, mentors, and company recruiters with a workflow that is transparent from application to offer.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
                <FiMail className="text-cyan-200" />
                placements@placementos.edu
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
                <FiMapPin className="text-cyan-200" />
                Campus Placement Office
              </div>
              <Link to="/login" className="block">
                <Button className="w-full" icon={FiArrowRight}>Open PlacementOS</Button>
              </Link>
            </div>
          </div>
        </GlassCard>
      </section>

      <footer className="border-t border-white/10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-white">{theme.appName}</p>
            <p className="mt-1">Campus placement management for institutions, recruiters, mentors, and students.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link className="hover:text-cyan-200" to="/login">Login</Link>
            <Link className="hover:text-cyan-200" to="/register">Register</Link>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
