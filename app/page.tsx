"use client";
import { useQuery } from "@tanstack/react-query";
import { SearchForm } from "@/components/search/search-form";
import { HomestayList } from "@/components/homestay/homestay-list";
import { CartLoader } from "@/components/cart/cart-loader";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";
import { HeroHeader } from "@/components/layout/hero-header";

export default function Home() {
  const {
    data: featuredHomestays = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["featured-homestays"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/homestays?featured=true`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch featured homestays");
      const data = await response.json();
      return data.homestays || [];
    },
  });

  const homestaysSectionRef = useRef<HTMLDivElement>(null);
  const scrollToHomestays = () => {
    document.getElementById("homestays-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen">
      <HeroHeader />
      {/* Hero Section - Full Screen */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/homepage-bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            For your love
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 text-white/90"
          >
            Cùng An's Homestay tìm kiếm những điểm đến tuyệt vời nhất dành cho bạn và người thân
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <SearchForm params={{}} />
          </motion.div>
        </div>
        {/* Scroll Indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          onClick={scrollToHomestays}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white hover:text-primary transition-colors"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="flex flex-col items-center"
          >
            <span className="text-sm mb-2">Khám phá thêm</span>
            <ChevronDown size={24} />
          </motion.div>
        </motion.button>
      </section>
      {/* Homestays Section */}
      <section ref={homestaysSectionRef} id="homestays-section" className="py-16 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Homestay nổi bật</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Những lựa chọn tuyệt vời được khách hàng yêu thích nhất
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {isLoading ? (
              <div className="text-center py-8">Đang tải homestay nổi bật...</div>
            ) : isError ? (
              <div className="text-center text-red-500 py-8">Không thể tải homestay nổi bật.</div>
            ) : (
              <HomestayList homestays={featuredHomestays} />
            )}
          </motion.div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Tại sao chọn chúng tôi?</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <h3 className="text-2xl font-bold mb-4 text-primary">Đặt phòng dễ dàng</h3>
              <p className="text-muted-foreground text-lg">
                Tìm kiếm, so sánh và đặt phòng homestay chỉ với vài cú nhấp chuột. Chúng tôi cung cấp giao diện đơn giản
                và trực quan.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <h3 className="text-2xl font-bold mb-4 text-primary">Trải nghiệm độc đáo</h3>
              <p className="text-muted-foreground text-lg">
                Khám phá những homestay độc đáo với thiết kế riêng biệt và trải nghiệm địa phương chân thực.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
