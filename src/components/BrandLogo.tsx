import Image from 'next/image';

export default function BrandLogo(){
 return <span className="brand-lockup"><Image src="/brand/gold-finder-logo.png" alt="" width={42} height={42} priority/><span>GOLD FINDER</span></span>
}
