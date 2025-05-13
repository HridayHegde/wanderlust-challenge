import { Destination } from "@prisma/client";
import React from "react";
import Image from "next/image";

const DestinationItem = ({ destination }: { destination: Destination }) => {
  return (
    <div key={destination.id} className="p-4 border rounded-lg flex gap-4">
      {destination.imageUrl && (
        <div className="relative w-32 h-32 flex-shrink-0">
          <Image
            src={destination.imageUrl}
            alt={destination.name}
            fill
            className="object-cover rounded-md"
          />
        </div>
      )}
      <div>
        <h3 className="font-semibold text-lg">{destination.name}</h3>
        <p className="text-muted-foreground">{destination.description}</p>
      </div>
    </div>
  );
};

export default DestinationItem;
