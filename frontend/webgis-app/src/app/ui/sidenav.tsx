import Link from 'next/link';
import NavLinks from './nav-links';
import { GlobeAltIcon } from '@heroicons/react/24/solid';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex flex-col items-center justify-center rounded-md bg-blue-600 p-4 md:h-30"
        href="/"
      >
        <GlobeAltIcon className="h-14 w-14 text-white mb-2" />
        <span className="text-4xl font-semibold text-white italic">eGIS</span> {/* テキストサイズとフォントウェイトを調整 */}
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
      </div>
    </div>
  );
}