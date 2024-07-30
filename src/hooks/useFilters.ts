import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState, useTransition} from "react";
import {FaFemale, FaMale} from "react-icons/fa";
import {Selection} from "@nextui-org/react";
import useFilterStore from "@/hooks/useFilterStore";
import usePaginationStore from "@/hooks/usePaginationStore";

export const useFilters = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [clientLoaded, setClientLoaded] = useState(false);
    const [isPending, startTransition] = useTransition();

    const orderByList = [
        {label: 'Last active', value: 'updated'},
        {label: 'Newest members', value: 'created'},
    ]

    const {filters, setFilters} = useFilterStore();

    const {pageNumber, pageSize, setPage} = usePaginationStore(state => ({
        pageNumber: state.pagination.pageNumber,
        pageSize: state.pagination.pageSize,
        setPage: state.setPage
    }));

    const {gender, ageRange, orderBy} = filters;

    useEffect(() => {
        if(gender || ageRange || orderBy) {
            setPage(1);
        }
    }, [gender, ageRange, orderBy, setPage])

    useEffect(() => {
        startTransition(() => {
            const searchParams = new URLSearchParams();

            if(gender) searchParams.set('gender', gender.join(','));
            if(ageRange) searchParams.set('ageRange', ageRange.toString());
            if(orderBy) searchParams.set('orderBy', orderBy);
            if (pageSize) searchParams.set('pageSize', pageSize.toString());
            if (pageNumber) searchParams.set('pageNumber', pageNumber.toString());

            router.replace(`${pathname}?${searchParams}`);
        })

    }, [ageRange, gender, orderBy, router, pathname, pageNumber, pageSize])

    const genderList = [
        {value: 'male', icon: FaMale},
        {value: 'female', icon: FaFemale},
    ]

    const handleAgeSelect = (value: number[]) => {
        setFilters('ageRange', value);
    }

    const handleOrderSelect = (value: Selection) => {
        if(value instanceof Set) {
            setFilters('orderBy', value.values().next().value);

        }
    }

    const handleGenderSelect = (value: string) => {
        if(gender.includes(value)) setFilters('gender', gender.filter(g => g !== value));
        else setFilters('gender', [...gender, value]);
    }

    return {
        orderByList,
        genderList,
        selectAge: handleAgeSelect,
        selectGender: handleGenderSelect,
        selectOrder: handleOrderSelect,
        filters,
        clientLoaded,
        isPending
    }
}