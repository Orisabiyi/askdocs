"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  MessageSquare,
  Shield,
  Upload,
  Search,
  Quote,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";

const ease = [0.22, 1, 0.36, 1] as const;

function RevealText({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay, ease }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function ChatDemo() {
  return (
    <div className="relative">
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-2.5 w-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-2.5 w-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 tracking-wide uppercase">
            AskDocs Chat
          </span>
          <div className="w-14" />
        </div>

        {/* Messages */}
        <div className="p-6 space-y-5">
          <motion.div
            className="flex justify-end"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="rounded-2xl rounded-br-none bg-zinc-900 dark:bg-zinc-100 px-4 py-2.5 text-[13px] text-white dark:text-zinc-900 max-w-xs">
              What is the termination clause?
            </div>
          </motion.div>

          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <div className="space-y-2.5 max-w-sm">
              <div className="rounded-2xl rounded-bl-none border border-zinc-150 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                <p>
                  Either party may terminate with{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">
                    30 days written notice
                  </strong>
                  . In case of breach, termination is immediate.
                </p>
              </div>
              <div className="flex gap-1.5 pl-1">
                <motion.span
                  className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer"
                  whileHover={{ y: -1 }}
                >
                  <FileText className="h-3 w-3" />
                  contract.pdf, p.12
                </motion.span>
                <motion.span
                  className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer"
                  whileHover={{ y: -1 }}
                >
                  <FileText className="h-3 w-3" />
                  contract.pdf, p.14
                </motion.span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative layers */}
      <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50" />
      <div className="absolute -bottom-6 -right-6 -z-20 h-full w-full rounded-lg border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/30" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900 transition-colors duration-300">
      {/* Nav */}
      <motion.nav
        className="flex items-center justify-between px-6 lg:px-10 py-5 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/" className="text-lg font-semibold tracking-tight">
          askdocs<span className="text-zinc-300 dark:text-zinc-600">.</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link
            href="#how-it-works"
            className="hidden sm:block text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            How it works
          </Link>
          <Link
            href="/login"
            className="text-[13px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Log in
          </Link>
          <ThemeToggle />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/signup"
              className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-[13px] font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Get started
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="px-6 lg:px-10 pt-24 sm:pt-32 pb-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div>
            <motion.p
              className="text-[13px] font-medium text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Document intelligence
            </motion.p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
              <RevealText>Your documents,</RevealText>
              <RevealText delay={0.1}>
                <span className="text-zinc-400 dark:text-zinc-500">
                  answering back.
                </span>
              </RevealText>
            </h1>

            <motion.p
              className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Upload any document. Ask a question in plain English. Get an
              answer with the exact page and paragraph it came from. That
              simple.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-md bg-zinc-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Try it free
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
              <span className="text-[13px] text-zinc-400 dark:text-zinc-500">
                No credit card required
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease }}
          >
            <ChatDemo />
          </motion.div>
        </div>
      </section>

      {/* Formats */}
      <section className="border-t border-zinc-100 dark:border-zinc-800">
        <div className="px-6 lg:px-10 py-10 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {["PDF", "DOCX", "TXT", "Markdown"].map((format, i) => (
              <FadeIn key={format} delay={i * 0.05}>
                <span className="text-[13px] font-medium text-zinc-300 dark:text-zinc-600 tracking-widest uppercase">
                  .{format.toLowerCase()}
                </span>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-zinc-100 dark:border-zinc-800 px-6 lg:px-10 py-24 sm:py-32"
      >
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <p className="text-[13px] font-medium text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mb-4">
              How it works
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-16 max-w-lg">
              From upload to insight in under 30 seconds.
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-3 gap-12 sm:gap-8">
            {[
              {
                num: "01",
                icon: Upload,
                title: "Upload your docs",
                desc: "Drag and drop PDFs, Word documents, or text files. We extract the text, split it into searchable chunks, and index everything automatically.",
              },
              {
                num: "02",
                icon: Search,
                title: "Ask anything",
                desc: "Type a question like you'd ask a colleague. Our retrieval pipeline searches across every document to find the most relevant passages.",
              },
              {
                num: "03",
                icon: Quote,
                title: "Verify the source",
                desc: "Every answer includes clickable citations — document name, page number, exact paragraph. You never have to take the AI's word for it.",
              },
            ].map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.1}>
                <div className="group">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[13px] font-mono text-zinc-300 dark:text-zinc-600">
                      {step.num}
                    </span>
                    <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors" />
                  </div>
                  <div className="mb-4">
                    <motion.div
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-100 dark:border-zinc-800"
                      whileHover={{ y: -2, borderColor: "currentColor" }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <step.icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    </motion.div>
                  </div>
                  <h3 className="text-base font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why AskDocs */}
      <section className="border-t border-zinc-100 dark:border-zinc-800 px-6 lg:px-10 py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            <FadeIn>
              <div>
                <p className="text-[13px] font-medium text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mb-4">
                  Why AskDocs
                </p>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                  Every answer has a receipt.
                </h2>
              </div>
            </FadeIn>

            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Shield,
                  title: "No hallucination",
                  desc: "If your documents don't contain the answer, AskDocs tells you. It never fabricates information to seem helpful.",
                },
                {
                  icon: FileText,
                  title: "Works with what you have",
                  desc: "Contracts, research papers, employee handbooks, technical docs — if you can read it, AskDocs can search it.",
                },
                {
                  icon: Quote,
                  title: "Cite-able answers",
                  desc: "Every response points to the exact source. Useful when you need to reference something in a meeting or report.",
                },
                {
                  icon: MessageSquare,
                  title: "Actually conversational",
                  desc: "Ask a broad question, then zoom in. Follow-up questions work naturally without re-explaining context.",
                },
              ].map((feature, i) => (
                <FadeIn key={feature.title} delay={i * 0.08}>
                  <motion.div
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 h-full"
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <feature.icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 mb-4" />
                    <h3 className="text-sm font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-t border-zinc-100 dark:border-zinc-800 px-6 lg:px-10 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <p className="text-[13px] font-medium text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mb-4">
              Use cases
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-16 max-w-md">
              Built for people who read for a living.
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                role: "Legal teams",
                task: "Search across contracts and compliance documents instantly",
              },
              {
                role: "Researchers",
                task: "Cross-reference findings across dozens of papers",
              },
              {
                role: "Students",
                task: "Study smarter by asking your textbooks direct questions",
              },
              {
                role: "Business analysts",
                task: "Extract insights from reports without reading 200 pages",
              },
            ].map((useCase, i) => (
              <FadeIn key={useCase.role} delay={i * 0.08}>
                <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
                  <p className="text-sm font-semibold mb-1">{useCase.role}</p>
                  <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {useCase.task}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-100 dark:border-zinc-800 px-6 lg:px-10 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-8 sm:px-16 py-16 sm:py-20 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4">
              Upload a document.
              <br />
              <span className="text-zinc-400 dark:text-zinc-500">
                Ask it anything.
              </span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
              Free to start. No credit card. Your documents stay yours.
            </p>
            <motion.div
              className="inline-block"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-md bg-zinc-900 dark:bg-zinc-100 px-6 py-3 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Get started free
                <ArrowUpRight className="h-3.5 w-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800 px-6 lg:px-10 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-zinc-400 dark:text-zinc-500">
          <span>
            <span className="text-zinc-900 dark:text-zinc-100 font-medium">
              askdocs
            </span>{" "}
            — document intelligence
          </span>
          <span>Built by Orisabiyi David</span>
        </div>
      </footer>
    </main>
  );
}