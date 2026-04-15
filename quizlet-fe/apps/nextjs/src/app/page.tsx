import Hero from "~/components/home/hero";
import LatestStudySets from "~/components/home/latest-study-sets";
import PopularStudySets from "~/components/home/popular-study-sets";
import { TRPCErrorBoundary } from "~/components/error-boundary/trpc-error-boundary";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TRPCErrorBoundary>
        <PopularStudySets />
      </TRPCErrorBoundary>
      <TRPCErrorBoundary>
        <LatestStudySets />
      </TRPCErrorBoundary>
    </>
  );
}
