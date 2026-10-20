import Image from "next/image";

export function BrandLogo({ className = "w-9 h-9", priority = false }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <Image
        src="/logo-icon.png"
        alt="Adaigi Logo"
        width={48}
        height={48}
        className="w-full h-full object-contain"
        priority={priority}
      />
    </div>
  );
}
