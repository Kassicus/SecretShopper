"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Gift, Users, Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if user is authenticated
    const checkAuth = async () => {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const session = await response.json();
        if (session?.user) {
          router.push('/dashboard');
        }
      }
    };

    checkAuth();
  }, [router]);

  const features = [
    {
      icon: Users,
      title: "Family Groups",
      description: "Create and manage family groups to coordinate gift giving"
    },
    {
      icon: Heart,
      title: "Wishlists",
      description: "Track what everyone wants and never forget preferences"
    },
    {
      icon: Gift,
      title: "Gift Tracking",
      description: "Claim items and track purchases to avoid duplicates"
    }
  ];

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-accent/10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
        {/* Hero Section */}
        <motion.div
          className="text-center space-y-8 max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              Secret Shopper
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                The smart way to gift
              </p>
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
          </motion.div>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Track family preferences and coordinate gift purchases with ease.
            Never forget sizes, colors, or wish items again.
          </motion.p>

          {/* Feature Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-accent/20 hover:border-primary/30 transition-all group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex gap-4 justify-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Button
              asChild
              size="lg"
              className="h-14 px-8 text-base shadow-xl hover:shadow-2xl transition-all"
            >
              <Link href="/register">
                Get Started
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base shadow-lg hover:shadow-xl transition-all border-2"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
