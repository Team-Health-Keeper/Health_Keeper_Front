import React from "react";

interface MapPaneProps {
  className?: string;
  containerRef: React.RefObject<HTMLDivElement> | React.MutableRefObject<HTMLDivElement | null>;
}

export function MapPane({ className, containerRef }: MapPaneProps) {
  return (
    <div className={"lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] h-72 sm:h-96 " + (className || "") }>
      <div className="h-full overflow-hidden rounded-3xl border-2 border-gray-200 shadow-lg">
        <div ref={containerRef as any} className="h-full w-full" />
      </div>
    </div>
  );
}
