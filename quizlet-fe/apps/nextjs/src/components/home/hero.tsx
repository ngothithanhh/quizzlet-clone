"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@acme/ui/button";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const features = [
  {
    icon: "📚",
    title: "Đa dạng cách học",
    desc: "Flashcard, Ôn tập, Matching và Test — giúp việc học luôn mới mẻ.",
    color: "from-blue-500 to-indigo-500",
    shadow: "shadow-blue-500/20"
  },
  {
    icon: "🎯",
    title: "Lặp lại thông minh",
    desc: "Tối ưu ghi nhớ bằng thuật toán lặp lại ngắt quãng theo khoa học.",
    color: "from-purple-500 to-pink-500",
    shadow: "shadow-purple-500/20"
  },
  {
    icon: "👥",
    title: "Học cùng bạn bè",
    desc: "Tạo nhóm học, chia sẻ bộ Flashcard và cùng nhau ôn tập.",
    color: "from-pink-500 to-rose-500",
    shadow: "shadow-pink-500/20"
  },
  {
    icon: "📊",
    title: "Theo dõi tiến độ",
    desc: "Xem thống kê chi tiết để biết mình đã học được bao nhiêu.",
    color: "from-cyan-500 to-blue-500",
    shadow: "shadow-cyan-500/20"
  }
];

export default function Hero() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Premium Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#06102b]">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[128px] animate-pulse mix-blend-screen" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-[128px] animate-pulse mix-blend-screen" style={{ animationDuration: '10s', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen" />
          
          {/* Subtle line overlays */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 container px-4 sm:px-6 mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center flex flex-col items-center"
          >
            {/* Animated Logo Container */}
            <motion.div variants={fadeIn} className="mb-10 relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-black/50 px-8 py-3 rounded-xl border border-white/10 backdrop-blur-xl">
                <span className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200 drop-shadow-2xl uppercase">
                  Quizzlet
                </span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 variants={fadeIn} className="mb-6 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Học mọi thứ,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">
                Nhớ tất cả
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={fadeIn} className="mb-10 text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              Chinh phục mọi môn học với Flashcard tương tác, nhiều chế độ ôn tập và thuật toán ghi nhớ thông minh.
            </motion.p>

            {/* Premium CTA Buttons */}
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-5 justify-center mb-20 w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 font-semibold px-10 py-6 text-lg rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
                asChild
              >
                <Link href="/latest">Bắt đầu học</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 font-semibold px-10 py-6 text-lg rounded-full backdrop-blur-md transition-all hover:scale-105"
                asChild
              >
                <Link href="/create-set">Tạo bộ Flashcard</Link>
              </Button>
            </motion.div>

            {/* Stats configured with Glassmorphism */}
            <motion.div variants={fadeIn} className="inline-grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10 rounded-full" />
              {[
                { value: "10M+", label: "Người học" },
                { value: "50M+", label: "Bộ Flashcard" },
                { value: "4.8★", label: "Đánh giá" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
                  <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#06102b] via-[#eef2ff] to-[#f8fafc] dark:from-[#06102b] dark:via-[#091530] dark:to-[#020617]">
        {/* Decorative elements for the bottom section */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#06102b] to-transparent z-10" />
          <div className="absolute -left-40 top-40 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute right-0 bottom-0 w-full h-[500px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-[100%] blur-3xl translate-y-1/2" />
        </div>

        <div className="container px-4 sm:px-6 mx-auto relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
              Tại sao chọn <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Quizzlet?</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Nền tảng học tập thế hệ mới — giúp ghi nhớ lâu và học hiệu quả hơn.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative h-full rounded-3xl bg-white/70 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 p-8 shadow-xl backdrop-blur-md hover:shadow-2xl transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.05] transition-opacity rounded-3xl`} />
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-3xl bg-gradient-to-br ${feature.color} shadow-lg ${feature.shadow} transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
