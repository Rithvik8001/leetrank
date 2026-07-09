import { getAllUniversities } from "@/lib/universities/queries";
import { UniversitySearch } from "@/components/universities/university-search";
import { SectionLabel } from "@/components/marketing/section-label";

export const metadata = { title: "Universities" };

export default async function UniversitiesPage() {
  const universities = await getAllUniversities();

  return (
    <div className="flex flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-4">
        <SectionLabel>Directory</SectionLabel>
        <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance text-foreground sm:text-5xl">
          Find your university
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Search {universities.length} schools and see how each one&apos;s CP
          community stacks up.
        </p>
      </div>

      <UniversitySearch
        universities={universities.map((university) => ({
          slug: university.slug,
          name: university.name,
          city: university.city,
          state: university.state,
          ownershipType: university.ownershipType,
        }))}
      />
    </div>
  );
}
