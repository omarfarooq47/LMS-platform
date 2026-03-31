import type { Metadata } from 'next';
import { Public_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/components/app/theme-provider';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { cn } from '@/lib/shadcn/utils';
import { getAppConfig, getStyles } from '@/lib/utils';
import '@/styles/globals.css';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});



const commitMono = localFont({
  display: 'swap',
  variable: '--font-commit-mono',
  src: [
    {
      path: '../../fonts/CommitMono-400-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../fonts/CommitMono-700-Regular.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../fonts/CommitMono-400-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../fonts/CommitMono-700-Italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
});

export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  return {
    title: appConfig.pageTitle,
    description: appConfig.pageDescription,
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const styles = getStyles(appConfig);
  const { companyName, logo, logoDark } = appConfig;
  return (
    <div
      id="checkin-root"
      className={cn(
        publicSans.variable,
        commitMono.variable,
        'overflow-x-hidden scroll-smooth font-sans antialiased'
      )}
    >
    {styles && (
      <style href="checkin-accent" precedence="default">
        {styles}
      </style>
    )}
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
        {/* <header className="fixed top-0 left-0 z-50 hidden w-full flex-row justify-between p-6 md:flex">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://oaktree.one/"
            className="scale-100 transition-transform duration-300 hover:scale-110"
          >
            
            <img src={logo} alt={`${companyName} Logo`} className="block size-6 dark:hidden" />
            
            <img
              src={logoDark ?? logo}
              alt={`${companyName} Logo`}
              className="hidden size-6 dark:block"
            />
          </a>
          <a
            href="/"
            aria-label={`${companyName} Home`}
            className="flex items-center gap-2"
          >
            <img
              src="oaktree.png"  //"/healmind-light.jpg"
              alt={`${companyName} Logo`}
              className="block h-45 dark:hidden"
            />
            <img
              src="oaktree.png"  //"/healmind-dark.jpg"
              alt={`${companyName} Logo`}
              className="hidden h-45 dark:block"
            />
          </a> 
        </header>*/}

       {children} 
        <div className="group fixed bottom-0 left-1/2 z-50 mb-2 -translate-x-1/2">
          <ThemeToggle className="translate-y-20 transition-transform delay-150 duration-300 group-hover:translate-y-0" />
        </div>
      </ThemeProvider>
    </div>
  );
}
