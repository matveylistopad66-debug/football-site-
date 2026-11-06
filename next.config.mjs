/** @type {import('next').NextConfig} */
const nextConfig = {
  // Заход на корень сайта (/) отправляет на русскую версию
  async redirects() {
    return [{ source: "/", destination: "/ru", permanent: false }];
  },
};

export default nextConfig;
