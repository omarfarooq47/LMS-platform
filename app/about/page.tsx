import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl text-foreground font-extrabold tracking-tight">
            About OakTree Platform
          </h1>
          <p className="text-lg text-foreground leading-relaxed">
            OakTree is a modern educational institution dedicated to fostering excellence
            in higher secondary education. Founded with a mission to empower the next generation
            of thinkers, leaders, and innovators.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our platform connects students, staff, and parents in a cohesive digital environment. 
            From interactive skill paths to real-time progress tracking, we ensure learning is engaging, dynamic, and effective.
          </p>
          <div className="bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow">
            <h3 className="font-bold text-xl text-foreground mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-900/60 text-emerald-400 flex items-center justify-center">🎯</span>
              Our Mission
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              To cultivate a dynamic learning community where every student can achieve their full potential, 
              supported by cutting-edge technology and dedicated educators.
            </p>
          </div>
        </div>
        <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/30 to-indigo-500/30 z-10 mix-blend-multiply" />
          <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-muted-foreground p-8 text-center border-4 border-border">
             <span className="text-6xl mb-4">🏫</span>
             <span className="font-medium text-xl text-foreground">Institution Campus</span>
             <span className="text-sm mt-2 text-muted-foreground">Placeholder for stunning campus photography</span>
          </div>
        </div>
      </div>
      
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-indigo-900 text-white shadow-xl">
          <h4 className="text-2xl font-bold mb-4">Contact Us</h4>
          <p className="text-indigo-200 mb-2">123 Education Boulevard</p>
          <p className="text-indigo-200 mb-2">Academic City, AC 12345</p>
          <p className="text-indigo-200 mt-6 font-medium">contact@oaktree.edu</p>
          <p className="text-indigo-200">+1 (555) 123-4567</p>
        </div>
        <div className="p-8 rounded-2xl bg-card border border-border shadow-sm md:col-span-2 flex items-center justify-center text-center">
             <div>
                <h4 className="text-2xl font-bold text-foreground mb-4">History & Foundation</h4>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Established in 2010, OakTree began as a visionary project to rethink higher secondary education. 
                    Over the years, we have expanded our curriculum to encompass advanced skill paths and modern pedagogies, 
                    always keeping student success at the core of our philosophy.
                </p>
             </div>
        </div>
      </div>
    </div>
    </div>
  );
}
