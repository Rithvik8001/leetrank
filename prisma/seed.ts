import { PrismaClient, type OwnershipType } from "@prisma/client";
import universities from "./seed-data/universities.json";

const prisma = new PrismaClient();

type SeedUniversity = {
  unitId: string | null;
  name: string;
  city: string;
  state: string;
  website: string | null;
  ownershipType: OwnershipType | null;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlug(name: string, state: string, used: Set<string>): string {
  const base = slugify(name);
  if (!used.has(base)) return base;

  const withState = `${base}-${state.toLowerCase()}`;
  if (!used.has(withState)) {
    console.warn(`Slug collision for "${name}" — using "${withState}"`);
    return withState;
  }

  let suffix = 2;
  let candidate = `${withState}-${suffix}`;
  while (used.has(candidate)) {
    suffix += 1;
    candidate = `${withState}-${suffix}`;
  }
  console.warn(`Slug collision for "${name}" — using "${candidate}"`);
  return candidate;
}

async function main() {
  const usedSlugs = new Set<string>();
  let created = 0;
  let updated = 0;

  for (const university of universities as SeedUniversity[]) {
    const slug = uniqueSlug(university.name, university.state, usedSlugs);
    usedSlugs.add(slug);

    const result = await prisma.university.upsert({
      where: { slug },
      update: {
        unitId: university.unitId,
        name: university.name,
        city: university.city,
        state: university.state,
        website: university.website,
        ownershipType: university.ownershipType,
      },
      create: {
        id: crypto.randomUUID(),
        unitId: university.unitId,
        name: university.name,
        slug,
        city: university.city,
        state: university.state,
        website: university.website,
        ownershipType: university.ownershipType,
      },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created += 1;
    } else {
      updated += 1;
    }
  }

  console.log(
    `Seeded ${universities.length} universities (${created} created, ${updated} updated).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
