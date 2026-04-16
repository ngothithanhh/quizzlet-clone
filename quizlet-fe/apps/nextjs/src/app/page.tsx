import Hero from "~/components/home/hero";
import LatestStudySets from "~/components/home/latest-study-sets";
import PopularStudySets from "~/components/home/popular-study-sets";
import { TRPCErrorBoundary } from "~/components/error-boundary/trpc-error-boundary";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="relative py-24 pb-32 bg-blue-50/60 dark:bg-[#07132e] overflow-hidden flex-1">
        {/* Sparkling/Glowing background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 dark:bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '7s' }} />
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/30 rounded-[100%] blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '9s' }} />
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-cyan-400/20 dark:bg-cyan-500/20 rounded-full blur-[100px] mix-blend-screen animate-[pulse_5s_ease-in-out_infinite]" />
          
          {/* Sparkle subtle grid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#4f46e510_1px,transparent_1px)] bg-[size:3rem_3rem] dark:bg-[radial-gradient(ellipse_at_center,#ffffff0a_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,#000_10%,transparent_100%)]" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 space-y-24">
          <TRPCErrorBoundary>
            <div className="relative">
              <PopularStudySets />
            </div>
          </TRPCErrorBoundary>
          
          <TRPCErrorBoundary>
            <div className="relative">
              <LatestStudySets />
            </div>
          </TRPCErrorBoundary>
        </div>
      </section>
    </>
  );
}
