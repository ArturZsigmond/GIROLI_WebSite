import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { getCategoryLabel } from "@/lib/categories";
import { ProjectShowcaseCard } from "@/components/ProjectShowcaseCard";

interface Employee {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}

interface ProjectShowcaseImage {
  id: string;
  url: string;
}

interface ProjectShowcase {
  id: string;
  title: string;
  description: string;
  category: string;
  images: ProjectShowcaseImage[];
}

async function getEmployees() {
  return await prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
  });
}

async function getProjectShowcases() {
  const showcases = await prisma.projectShowcase.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
      images: {
        orderBy: { id: "asc" }
      }
    },
  });
  return showcases;
}

export default async function DespreNoiPage() {
  const employees = await getEmployees();
  const showcases = await getProjectShowcases();

  // Group showcases by category
  const showcasesByCategory = showcases.reduce((acc, showcase) => {
    if (!acc[showcase.category]) {
      acc[showcase.category] = [];
    }
    acc[showcase.category].push(showcase);
    return acc;
  }, {} as Record<string, ProjectShowcase[]>);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Wood Background */}
      <div 
        className="fixed inset-0 z-0 w-full h-full"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden="true"
      >
        {/* Overlay for better readability - more subtle wood texture */}
        <div className="absolute inset-0 bg-white/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
        <Header />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* About Company Section */}
        <section className="mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Despre Noi</h1>
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Bine ați venit la Giroli CNC! Suntem o companie dedicată creării de mobilier
              de înaltă calitate, personalizat pentru nevoile dumneavoastră. Cu ani de
              experiență în domeniu, ne mândrim cu atenția la detalii și pasiunea pentru
              design-ul funcțional și estetic.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Oferim soluții complete de mobilier pentru bucătării, băi, dormitoare și
              spații de living, precum și proiecte complet furnizate care transformă
              casele în locuri de vis.
            </p>
          </div>
        </section>

        {/* Employees Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Echipa Noastră</h2>
          {employees.length === 0 ? (
            <p className="text-gray-600">Informații despre echipă vor fi disponibile în curând.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="w-full aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={employee.imageUrl}
                      alt={employee.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {employee.name}
                    </h3>
                    <p className="text-blue-700 font-medium mb-3">{employee.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {employee.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Project Showcases Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Proiecte Complet Furnizate</h2>
          
          {Object.keys(showcasesByCategory).length === 0 ? (
            <p className="text-gray-600">Proiecte vor fi disponibile în curând.</p>
          ) : (
            Object.entries(showcasesByCategory).map(([category, categoryShowcases]) => (
              <div key={category} className="mb-12">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                  {getCategoryLabel(category)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categoryShowcases.map((showcase) => (
                    <ProjectShowcaseCard key={showcase.id} showcase={showcase} />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
        </main>

        <footer className="bg-white/90 backdrop-blur-sm border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-gray-600">
              © {new Date().getFullYear()} Giroli Mob. Toate drepturile rezervate.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

