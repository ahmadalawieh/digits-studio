import localFont from 'next/font/local';
import './globals.css';

const arabic = localFont({src:[{path:'../public/assets/fonts/IBMPlexSansArabic-Regular.woff2',weight:'400'},{path:'../public/assets/fonts/IBMPlexSansArabic-SemiBold.woff2',weight:'600'}],variable:'--font-arabic',display:'swap'});
const english = localFont({src:'../public/assets/fonts/Archivo.woff2',variable:'--font-english',display:'swap'});
export const metadata = {title:'منيو تجريبي — Digits Studio',description:'نموذج عملي لتصميم منيو رقمي للمطاعم والكافيهات. الأصناف والأسعار للتوضيح.'};
export default function RootLayout({children}) {
  return <html lang="ar" dir="rtl" className={`${arabic.variable} ${english.variable}`}><body>{children}</body></html>;
}
