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
  eyebrow: "Available for 140+ universities",
  headline: "The leaderboard of record for competitive programmers.",
  subhead:
    "Connect your LeetCode account and see exactly where you stand among verified programmers at your university and across the LeetRank network.",
  primaryCta: { label: "Claim your rank", href: "/signup" },
  secondaryCta: { label: "Preview the standings", href: "#analytics" },
} as const;

export const socialProof = {
  label: "Illustrative campus network",
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
      "One verified roster with current snapshots",
      "Synced daily or refreshed on demand",
      "Ranked by rating, solves, or contest performance",
      "Progress tracked across daily snapshots",
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
        "LeetRank pulls your solved totals, contest rating, rank, and badges into one verified snapshot.",
    },
    {
      number: "04",
      title: "Compete",
      description:
        "Join your campus standings, compare verified profiles, and compete in private groups.",
    },
  ],
} as const;

export const featureGrid = {
  eyebrow: "Everything included",
  heading: "Everything a CP club actually needs.",
  features: [
    {
      title: "University leaderboards",
      description:
        "Ranked by rating, problems solved, hard problems, or global rank using the latest successful sync.",
      size: "wide",
      href: "#universities",
      cta: "View leaderboards",
    },
    {
      title: "Progress analytics",
      description:
        "Solved totals, hard-problem progress, and contest-rating history across daily snapshots.",
      size: "tall",
      href: "#analytics",
      cta: "See the data",
    },
    {
      title: "Peer comparison",
      description: "Head-to-head stats against another verified LeetRank profile.",
      size: "sm",
      href: "/signup",
      cta: "Compare stats",
    },
    {
      title: "Verified profiles",
      description: "Bio-code verification means every rank on the board is real.",
      size: "sm",
      href: "#how-it-works",
      cta: "How it works",
    },
    {
      title: "Public share profile",
      description: "A shareable profile page for resumes and LinkedIn.",
      size: "wide",
      href: "/signup",
      cta: "Claim your profile",
    },
    {
      title: "Contest history",
      description: "Upcoming contests and detailed past-contest performance are on the roadmap.",
      size: "sm",
      href: "/signup",
      cta: "Join early access",
      status: "coming-soon",
    },
  ],
} as const;

export const analyticsPreview = {
  eyebrow: "Progress analytics",
  heading: "See the grind, not just the total.",
  body: "Daily snapshots already track solved progress and rating trends. Submission-level history is the next layer on the roadmap.",
  heatmapLabel: "Submission history",
  heatmapStatus: "Coming soon",
  ratingLabel: "Contest rating",
} as const;

export const clubCta = {
  eyebrow: "For club admins",
  heading: "Run a club? Bring your whole roster onto one leaderboard.",
  body: "Create a private group after verification, then invite your ACM, ICPC, or GDSC peers with one link.",
  cta: { label: "Set up your group", href: "/signup" },
} as const;

export const statsBand = {
  disclaimer: "Illustrative data — LeetRank is in early access.",
  stats: [
    { value: 12400, suffix: "+", label: "problems solved this week" },
    { value: 140, suffix: "+", label: "universities available" },
    { value: 8900, suffix: "+", label: "verified student profiles" },
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
        "You can hide your public profile at any time. Full account deletion and LeetCode unverification controls are planned.",
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
  ],
} as const;
