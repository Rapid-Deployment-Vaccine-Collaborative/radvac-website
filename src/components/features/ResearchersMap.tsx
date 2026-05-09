"use client";

export function ResearchersMap() {
  return (
    <div className="space-y-8">
      {/* Map Embed */}
      <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
        <iframe
          src="https://www.google.com/maps/d/u/1/embed?mid=1s5PSVi56YS2sGOSri5G8jEdDFeH0kHEs"
          width="100%"
          height="0"
          style={{ aspectRatio: "16/10", height: "auto", minHeight: "400px" }}
          className="w-full border-0"
          loading="lazy"
          title="RaDVaC Researchers Map"
          allowFullScreen
        />
      </div>

      {/* Description */}
      <p className="text-text-secondary text-center max-w-2xl mx-auto">
        This map shows researchers and collaborators around the world who are
        participating in RaDVaC&apos;s open-source vaccine development. Want to join?
        Contact us to be added to the map.
      </p>
    </div>
  );
}
