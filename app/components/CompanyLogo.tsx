"use client";

import { useState } from "react";

interface CompanyLogoProps {
    logo: string | null;
    name: string;
    size?: "small" | "large";
    className?: string;
}

export default function CompanyLogo({ logo, name, size = "small", className = "" }: CompanyLogoProps) {
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
        small: "h-8 w-8",
        large: "h-16 w-16",
    };

    const fallbackSizeClasses = {
        small: "text-xs",
        large: "text-2xl",
    };

    if (!logo || imageError) {
        return (
            <div
                className={`flex ${sizeClasses[size]} items-center justify-center rounded bg-zinc-200 font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 ${className}`}
            >
                <span className={fallbackSizeClasses[size]}>
                    {name.charAt(0).toUpperCase()}
                </span>
            </div>
        );
    }

    return (
        <img
            src={logo}
            alt={`${name} logo`}
            className={`${sizeClasses[size]} rounded object-cover ${size === "large" ? "rounded-lg" : ""} ${className}`}
            onError={() => setImageError(true)}
        />
    );
}

