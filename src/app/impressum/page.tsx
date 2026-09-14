import type { Metadata } from 'next';
import LegalPage from '../../components/LegalPage';
export const metadata: Metadata = {title:'Legal Notice / Impressum — Gold Finder',alternates:{canonical:'/impressum'}};
export default function Impressum(){return <LegalPage title="Legal Notice / Impressum">
<h2>Website operator</h2><p>Provider information pursuant to § 5 of the German Digital Services Act (DDG).</p>
<address><strong>Pascal Weyers</strong><br/>Gold Finder · gold-finder.com<br/>Birkenwaldstr. 46<br/>63179 Obertshausen<br/>Germany</address>
<h2>Contact</h2><p>Email: <a href="mailto:info@noonoo.de">info@noonoo.de</a></p><p>VAT identification number: DE299749508</p>
<h2>Editorial responsibility</h2><p>Responsible for editorial content: Pascal Weyers, at the address above.</p>
<h2>About this website</h2><p>Gold Finder provides information about physical gold and links to external providers. We do not sell gold, take orders or provide individual investment advice. Transactions take place with the respective external provider. Gold prices can fall as well as rise.</p>
<h2>Affiliate links</h2><p>As an Amazon Associate, Gold Finder earns from qualifying purchases. Links marked as Amazon affiliate links include our partner identifier. Other linked sources are not presented as confirmed commercial partnerships.</p>
<h2>Content and external links</h2><p>We maintain our content with care. Product details, availability and prices must be checked with the relevant provider. External websites are operated independently. Please contact us if you identify an error or a possible infringement so that we can review it.</p>
<h2>Copyright</h2><p>Website text, imagery and design may be protected by copyright. Third-party names and marks belong to their respective owners. Uses beyond statutory permissions require permission from the relevant rights holder.</p>
<p>Information about personal data is available in our <a href="/datenschutz">Privacy Policy / Datenschutz</a>.</p>
</LegalPage>}
