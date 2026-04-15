import Image from "next/image";
import Link from "next/link";
import { Button } from "@acme/ui/button";

export default function Hero() {
  return (
    <div className="mb-16">
      {/* Hero Section */}
      <div className="min-h-[600px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden flex items-center justify-center">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <Image src="/logo.svg" alt="logo" width={180} height={40} className="drop-shadow-lg" />
            </div>

            {/* Main Heading */}
            <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              Learn Anything,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-100">
                Memorize Everything
              </span>
            </h1>

            {/* Subheading */}
            <p className="mb-12 text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Master any subject with interactive flashcards, interactive learning modes, and spaced repetition. Join millions of students learning smarter.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-8"
                asChild
              >
                <Link href="/latest">
                  Start Learning
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 font-semibold px-8"
                asChild
              >
                <Link href="/create-set">
                  Create Study Set
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 md:gap-12 text-white">
              <div>
                <div className="text-3xl md:text-4xl font-bold">10M+</div>
                <div className="text-sm md:text-base text-white/80">Active Learners</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">50M+</div>
                <div className="text-sm md:text-base text-white/80">Study Sets</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">4.8★</div>
                <div className="text-sm md:text-base text-white/80">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            Why Choose Quizlet Clone?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-100">
                  <span className="text-2xl">📚</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Learning Modes</h3>
                <p className="text-gray-600">
                  Flashcards, Learn mode, Memory game, and Test mode to keep your studying fresh and engaging.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Spaced Repetition</h3>
                <p className="text-gray-600">
                  Optimize your learning with scientifically-backed spaced repetition algorithm.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-pink-100">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Collaboration</h3>
                <p className="text-gray-600">
                  Create study groups, share study sets, and learn together with friends.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-cyan-100">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
                <p className="text-gray-600">
                  Monitor your learning progress with detailed statistics and insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
