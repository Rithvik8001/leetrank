export const nav = {
  links: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Universities", href: "#universities" },
    { label: "FAQ", href: "#faq" },
  ],
  cta: { label: "Join your university", href: "/signup" },
} as const;

export const hero = {
  eyebrow: "Now live at 340+ universities",
  headline: "The leaderboard of record for competitive programmers.",
  subhead:
    "Connect your LeetCode account, verify in seconds, and see exactly where you stand against every CP student at your university — and every university around it.",
  primaryCta: { label: "Claim your rank", href: "/signup" },
  secondaryCta: { label: "See a live leaderboard", href: "#analytics" },
} as const;

export const socialProof = {
  label: "Trusted by CP communities at",
  universities: [
    "Northbridge Tech",
    "Riverside State",
    "Cascade Institute of Technology",
    "Fairview University",
    "Lakeshore Polytechnic",
  ],
} as const;

export const problemSection = {
  eyebrow: "The problem",
  heading: "Stop tracking progress in a spreadsheet nobody opens.",
  body: "Coding clubs still maintain manual rosters of usernames, solved counts, and contest ratings by hand. They go stale within a week — and nobody can tell who's actually improving.",
  before: {
    label: "The old way",
    items: [
      "\"leetcode_tracker_FINAL_v3.xlsx\"",
      "Usernames copy-pasted into a shared doc",
      "Solved counts checked manually, once a semester",
      "No idea who's actually active this week",
    ],
  },
  after: {
    label: "With LeetRank",
    items: [
      "One verified roster, always current",
      "Synced automatically from LeetCode",
      "Ranked by rating, solves, or contest performance",
      "Updated the moment a submission lands",
    ],
  },
} as const;

export const howItWorks = {
  eyebrow: "How it works",
  heading: "From LeetCode profile to campus rank in under a minute.",
  steps: [
    {
      number: "01",
      title: "Connect",
      description:
        "Enter your LeetCode username — no OAuth, no password sharing, nothing to install.",
    },
    {
      number: "02",
      title: "Verify",
      description:
        "We generate a one-time code. Paste it into your LeetCode bio so we know it's really you.",
    },
    {
      number: "03",
      title: "Sync",
      description:
        "LeetRank pulls your solved problems, contest rating, and submission history automatically.",
    },
    {
      number: "04",
      title: "Compete",
      description:
        "You're ranked instantly against your university — and every other one on LeetRank.",
    },
  ],
} as const;

export const featureGrid = {
  eyebrow: "Everything included",
  heading: "Everything a CP club actually needs.",
  features: [
    {
      title: "Live university leaderboards",
      description:
        "Ranked by rating, problems solved, or contest performance — updated the moment new submissions land.",
      size: "wide",
    },
    {
      title: "Progress analytics",
      description:
        "Submission heatmaps and rating history, tracked automatically — the detail a spreadsheet never captured.",
      size: "tall",
    },
    {
      title: "Peer comparison",
      description: "Head-to-head stats against any classmate, section, or year.",
      size: "sm",
    },
    {
      title: "Verified profiles",
      description: "Bio-code verification means every rank on the board is real.",
      size: "sm",
    },
    {
      title: "Public share profile",
      description: "A shareable profile page for resumes and LinkedIn.",
      size: "wide",
    },
    {
      title: "Contest tracking",
      description: "Upcoming and past contest performance, synced from LeetCode.",
      size: "sm",
    },
  ],
} as const;

export const analyticsPreview = {
  eyebrow: "Progress analytics",
  heading: "See the grind, not just the total.",
  body: "Every submission plotted on a calendar. Every rating change plotted on a timeline. The kind of detail a spreadsheet never captured.",
  heatmapLabel: "Submissions, last 120 days",
  ratingLabel: "Contest rating",
} as const;

export const clubCta = {
  eyebrow: "For club admins",
  heading: "Run a club? Bring your whole roster onto one leaderboard.",
  body: "Invite your entire ACM, ICPC, or GDSC chapter in one link. No more manually chasing usernames before every meeting.",
  cta: { label: "Set up your club", href: "/clubs/new" },
} as const;

export const statsBand = {
  disclaimer: "Illustrative data — LeetRank is in early access.",
  stats: [
    { value: "12,400+", label: "problems solved this week" },
    { value: "340+", label: "universities represented" },
    { value: "8,900+", label: "verified student profiles" },
  ],
} as const;

export const faq = {
  eyebrow: "FAQ",
  heading: "Questions, answered.",
  items: [
    {
      question: "Is this affiliated with LeetCode?",
      answer:
        "No. LeetRank is an independent analytics layer built on top of publicly available LeetCode profile data. We're not affiliated with, endorsed by, or sponsored by LeetCode.",
    },
    {
      question: "How does verification work?",
      answer:
        "We generate a one-time code for your account. Paste it into your LeetCode profile bio, and we confirm it's there — proving you own the username without ever needing your password.",
    },
    {
      question: "Is my data public?",
      answer:
        "Your university leaderboard position is visible to other verified students at your university by default. Your public share profile is opt-in — you choose whether to make it visible outside your university.",
    },
    {
      question: "Can I remove my profile later?",
      answer:
        "Yes. You can unverify or delete your LeetRank profile at any time, which removes you from all leaderboards immediately.",
    },
    {
      question: "Does this work for other universities, not just my own?",
      answer:
        "Yes — every verified university on LeetRank gets its own leaderboard, and you can compare across universities as well as within yours.",
    },
  ],
} as const;

export const finalCta = {
  heading: "Find out where you actually stand.",
  body: "Connect your LeetCode account and join your university's leaderboard in under a minute.",
  cta: { label: "Claim your rank", href: "/signup" },
} as const;

export const footer = {
  tagline: "Track progress. Compare with peers. Discover top coders.",
  columns: [
    {
      heading: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "How it works", href: "#how-it-works" },
        { label: "Universities", href: "#universities" },
      ],
    },
    {
      heading: "Community",
      links: [
        { label: "For clubs", href: "#club-cta" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ],
} as const;
