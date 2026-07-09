import { getAllUniversities } from "@/lib/universities/queries";
import { UniversitySearch } from "@/components/universities/university-search";
import { SectionLabel } from "@/components/marketing/section-label";

export const metadata = { title: "Universities" };

export default async function UniversitiesPage() {
  const universities = await getAllUniversities();

  return (
    <div className="flex flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <SectionLabel>Directory</SectionLabel>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Universities
        </h1>
        <p className="text-sm text-muted-foreground">
          Find your school and see how it stacks up.
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
