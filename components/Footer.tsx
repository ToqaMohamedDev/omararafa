"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { motion } from "framer-motion";

// Social Media Icons
const FacebookIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TikTokIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export default function Footer() {
  const { theme } = useTheme();

  const socialLinks = [
    {
      name: "فيسبوك",
      url: "https://www.facebook.com/p/%D8%A3%D8%B9%D9%85%D8%B1-%D8%B9%D8%B1%D9%81%D8%A9-mrOmar-Arafa-100083062796232/",
      icon: FacebookIcon,
      color: "hover:text-blue-500",
    },
    {
      name: "يوتيوب",
      url: "https://www.youtube.com/@omararafa-arabic/videos",
      icon: YouTubeIcon,
      color: "hover:text-red-500",
    },
    {
      name: "تيك توك",
      url: "https://www.tiktok.com/@omararafa95?_r=1&_t=ZS-91VQTjRLq6b",
      icon: TikTokIcon,
      color: "hover:text-black dark:hover:text-white",
    },
    {
      name: "واتساب",
      url: "https://wa.me/201146525436",
      icon: WhatsAppIcon,
      color: "hover:text-green-500",
    },
  ];

  return (
    <footer
      className={`${
        theme === "dark" ? "bg-footer-dark" : "bg-footer-light"
      } text-white py-8 mt-auto`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">عمر عرفه</h3>
            <p className="text-gray-300 mb-4">
              مدرس لغة عربية أزهري بخبرة 7 سنوات في تدريس اللغة العربية
            </p>
            
            {/* Social Media Links */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">تابعنا على</h4>
              <div className="flex items-center gap-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`text-gray-300 ${social.color} transition-all duration-300 cursor-pointer`}
                      aria-label={social.name}
                    >
                      <IconComponent />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  href="/tests"
                  className="text-gray-300 hover:text-white transition"
                >
                  الاختبارات
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="text-gray-300 hover:text-white transition"
                >
                  الدورات
                </Link>
              </li>
              <li>
                <Link
                  href="/videos"
                  className="text-gray-300 hover:text-white transition"
                >
                  الفيديوهات
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-white transition"
                >
                  التواصل
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition"
                >
                  عن الموقع
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">معلومات</h3>
            <ul className="space-y-2 text-gray-300">
              <li>التخصص: لغة عربية</li>
              <li>الخبرة: 7 سنوات</li>
              <li>المؤسسة: الأزهر الشريف</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <Link
              href="https://www.facebook.com/alaa.taha.71271466/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 transition-colors duration-300 underline decoration-2 underline-offset-4 hover:decoration-primary-500 font-semibold"
            >
              AlaaTaha
            </Link>
            . جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}

