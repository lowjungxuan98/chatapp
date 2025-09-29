import { SiteHeader } from '@/components/my-ui/header';
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations('HomePage');
  
  return (
    <div className="">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">{t('description')}</p>
      </main>
    </div>
  );
}
