"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { ButtonContent } from "../ui/button-content";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero.jpg"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 md:bg-gradient-to-r md:from-black/70 md:via-black/50 md:to-transparent z-10" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 px-6 md:px-12 text-center md:text-left w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            The Luxe Vanguard of{" "}
            <span className="bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
              Streetwear Culture
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-200 max-w-3xl mb-8 mx-auto md:mx-0">
            Defining tomorrow’s style today. Premium drops, community battles,
            and AI-powered styling.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/drop" passHref>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
              >
                <ButtonContent>
                  Explore Drops
                  <ArrowRight className="w-5 h-5 ml-2" />
                </ButtonContent>
              </Button>
            </Link>
            <Link href="/arena" passHref>
              <Button
                asChild
                variant="outline"
                className="text-black border-white/30 hover:bg-white/10"
              >
                <ButtonContent>
                  <Play className="mr-2 w-5 h-5" />
                  Join Arena
                </ButtonContent>
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </section>
  );
}
