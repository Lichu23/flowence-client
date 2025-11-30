// src/app/pos/components/POSHeader.tsx

import { FC } from "react";
import Image from "next/image";

interface POSHeaderProps {
  storeName: string;
  logoUrl?: string;
}

export const POSHeader: FC<POSHeaderProps> = ({ storeName, logoUrl }) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      {logoUrl && (
        <Image
          src={logoUrl}
          alt="Store logo"
          width={32}
          height={32}
          className="h-6 w-6 sm:h-8 sm:w-8 object-contain rounded flex-shrink-0"
        />
      )}
      <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
        Caja - {storeName}
      </h1>
    </div>
  );
};
