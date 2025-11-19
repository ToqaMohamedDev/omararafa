"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, X, User, LogOut, Settings } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/tests", label: "الاختبارات" },
    { href: "/courses", label: "الدورات" },
    { href: "/videos", label: "الفيديوهات" },
    { href: "/contact", label: "التواصل" },
    { href: "/about", label: "عن الموقع" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }}
      className={`sticky top-0 z-50 border-b transition-all duration-300 backdrop-blur-md ${
        scrolled
          ? "bg-white/80 dark:bg-gray-800/80 border-primary-200/50 dark:border-primary-800/50 shadow-lg"
          : "bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 shadow-md"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between items-center min-h-[80px] py-3">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-shrink-0"
          >
            <Link
              href="/"
              className="text-xl md:text-2xl lg:text-3xl font-bold text-primary-DEFAULT hover:text-primary-dark transition-colors flex items-center gap-2"
            >
              <motion.span
                className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1.5 rounded-lg"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                ع
              </motion.span>
              <span className="hidden sm:inline">عمر عرفه</span>
            </Link>
          </motion.div>

          {/* Desktop Menu - All Links Together */}
          <div className="hidden lg:flex items-center flex-1 justify-center gap-1 xl:gap-2 mx-6">
            {/* Main Navigation Links */}
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-DEFAULT transition-colors font-medium px-3 xl:px-4 py-2 rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-900/10 relative group text-sm xl:text-base"
                  >
                    {link.label}
                    {/* الخط البرتقالي المتحرك */}
                    <motion.span
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: isActive ? "100%" : "0%",
                      }}
                      whileHover={{ width: "100%" }}
                      transition={{
                        duration: 0.25,
                        ease: "easeInOut",
                      }}
                      style={{ originX: 0 }}
                    />
                  </Link>
                </motion.div>
              );
            })}

            {/* Divider */}
            {isAuthenticated && (
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
            )}

            {/* Auth Links - Inside Menu */}
            {isAuthenticated ? (
              <>
                {user?.email === "dzggghjg@gmail.com" && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: navLinks.length * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/admin"
                      className={`text-gray-700 dark:text-gray-300 hover:text-primary-DEFAULT transition-colors flex items-center gap-1.5 px-3 xl:px-4 py-2 rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-900/10 font-medium text-sm xl:text-base relative group ${
                        pathname === "/admin" ? "text-primary-DEFAULT" : ""
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      <span>لوحة التحكم</span>
                      {pathname === "/admin" && (
                        <motion.span
                          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.25 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (navLinks.length + (user?.email === "dzggghjg@gmail.com" ? 1 : 0)) * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/profile"
                    className={`text-gray-700 dark:text-gray-300 hover:text-primary-DEFAULT transition-colors flex items-center gap-1.5 px-3 xl:px-4 py-2 rounded-lg hover:bg-primary-50/50 dark:hover:bg-primary-900/10 font-medium text-sm xl:text-base relative group ${
                      pathname === "/profile" ? "text-primary-DEFAULT" : ""
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[100px] xl:max-w-none truncate">{user?.name}</span>
                    {pathname === "/profile" && (
                      <motion.span
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.25 }}
                      />
                    )}
                  </Link>
                </motion.div>
                <motion.button
                  onClick={logout}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (navLinks.length + (user?.email === "dzggghjg@gmail.com" ? 2 : 1)) * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-DEFAULT transition-colors px-3 xl:px-4 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 font-medium text-sm xl:text-base"
                >
                  <LogOut className="w-4 h-4 ml-1.5" />
                  <span>تسجيل الخروج</span>
                </motion.button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/auth/login"
                  className="btn-primary px-4 xl:px-6 py-2 text-sm xl:text-base font-semibold whitespace-nowrap"
                >
                  تسجيل الدخول
                </Link>
              </motion.div>
            )}
          </div>

          {/* Right Side - Theme Toggle Only */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            {mounted && (
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-12 h-6 rounded-full p-1 transition-colors duration-300"
                style={{
                  backgroundColor: theme === "dark" ? "#1e293b" : "#e2e8f0",
                }}
                aria-label="تبديل الوضع"
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                  animate={{
                    left: theme === "dark" ? "4px" : "calc(100% - 24px)",
                    backgroundColor: theme === "dark" ? "#fbbf24" : "#f59e0b",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 700,
                    damping: 30,
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={theme}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      {theme === "dark" ? (
                        <Moon className="w-3 h-3 text-white" />
                      ) : (
                        <Sun className="w-3 h-3 text-white" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
            {mounted && (
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-1 rounded-xl transition-all duration-200 overflow-hidden"
                style={{
                  background: theme === "dark"
                    ? "linear-gradient(145deg, #1e293b, #0f172a)"
                    : "linear-gradient(145deg, #f1f5f9, #e2e8f0)",
                  boxShadow: theme === "dark"
                    ? "inset 4px 4px 8px #0f172a, inset -4px -4px 8px #334155"
                    : "inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff",
                }}
                aria-label="تبديل الوضع"
              >
                <motion.div
                  className="relative w-10 h-5 rounded-full p-0.5 overflow-hidden"
                  style={{
                    background: theme === "dark"
                      ? "linear-gradient(145deg, #334155, #1e293b)"
                      : "linear-gradient(145deg, #e2e8f0, #f1f5f9)",
                    boxShadow: theme === "dark"
                      ? "inset 2px 2px 4px #0f172a, inset -2px -2px 4px #475569"
                      : "inset 2px 2px 4px #cbd5e1, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <motion.div
                    className="absolute top-0.5 bottom-0.5 w-3.5 rounded-full flex items-center justify-center"
                    animate={{
                      right: theme === "dark" ? "auto" : "4px",
                      left: theme === "dark" ? "4px" : "auto",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    style={{
                      background: theme === "dark"
                        ? "linear-gradient(145deg, #fbbf24, #f59e0b)"
                        : "linear-gradient(145deg, #fbbf24, #f59e0b)",
                      boxShadow: theme === "dark"
                        ? "2px 2px 4px #0f172a, -2px -2px 4px #475569"
                        : "2px 2px 4px #cbd5e1, -2px -2px 4px #ffffff",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={theme}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.2 }}
                      >
                        {theme === "dark" ? (
                          <Sun className="w-2.5 h-2.5 text-white" />
                        ) : (
                          <Moon className="w-2.5 h-2.5 text-white" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              </motion.button>
            )}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition"
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-t border-gray-200 dark:border-gray-700"
            >
              <motion.div
                className="flex flex-col gap-2 py-4"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className={`block text-gray-700 dark:text-gray-300 hover:text-primary-DEFAULT transition relative py-2.5 px-4 rounded-lg text-base font-medium ${
                          isActive
                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-DEFAULT"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                        {isActive && (
                          <motion.span
                            className="absolute right-0 top-0 bottom-0 w-1 bg-primary-DEFAULT rounded-l-lg"
                            layoutId="mobileActiveIndicator"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
                {isAuthenticated ? (
                  <>
                    {user?.email === "dzggghjg@gmail.com" && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: navLinks.length * 0.05 }}
                      >
                        <Link
                          href="/admin"
                          className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-DEFAULT transition py-2.5 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 ml-2" />
                          لوحة التحكم
                        </Link>
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.05 }}
                    >
                      <Link
                        href="/profile"
                        className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-DEFAULT transition py-2.5 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 ml-2" />
                        {user?.name}
                      </Link>
                    </motion.div>
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navLinks.length + 1) * 0.05 }}
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-DEFAULT transition text-right py-2.5 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 w-full"
                    >
                      <LogOut className="w-4 h-4 ml-2" />
                      تسجيل الخروج
                    </motion.button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/auth/login"
                      className="block bg-primary-DEFAULT text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition text-center font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      تسجيل الدخول
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
