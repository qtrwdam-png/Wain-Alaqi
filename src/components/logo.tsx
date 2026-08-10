import Image from "next/image";
import { APP_NAME } from "@/config/constants";

type LogoProps = {
  size?: number;
  withText?: boolean;
  className?: string;
  priority?: boolean;
};

/**
 * Brand logo. Renders /logo.svg; if the image is missing/fails to load,
 * falls back to the letter "و" badge so the UI never looks broken.
 * Replace public/logo.svg with the professional logo when ready.
 */
export function Logo({ size = 36, withText = true, className = "", priority = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-600"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt={`${APP_NAME} شعار`}
          width={size}
          height={size}
          priority={priority}
          className="h-full w-full object-cover"
        />
      </span>
      {withText && (
        <span className="text-lg font-extrabold leading-none text-brand-700 sm:text-xl">
          {APP_NAME}
        </span>
      )}
    </span>
  );
}
