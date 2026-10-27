import Script from 'next/script';
import pageContent from './page-content';

export default function Page() {
  return (
    <>
      <div className="next-page-content" dangerouslySetInnerHTML={{ __html: pageContent }} />
      <Script src="/script.js" strategy="afterInteractive" />
    </>
  );
}
