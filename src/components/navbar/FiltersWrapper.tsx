'use client'

import React from 'react';
import {usePathname} from "next/navigation";
import Filters from "@/components/navbar/Filters";

export default function FiltersWrapper() {
    const pathname = usePathname();

    if (pathname === '/members') return <Filters />;
    else return null;
};