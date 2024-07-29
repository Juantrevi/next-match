import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useState} from "react";
import {FaFemale, FaMale} from "react-icons/fa";
import {Selection} from "@nextui-org/react";
import useFilterStore from "@/hooks/useFilterStore";

export const useFilters = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [clientLoaded, setClientLoaded] = useState(false)
    const selectedGender = searchParams.get('gender')?.split(',') || ['male', 'female'];

    const orderByList = [
        {label: 'Last active', value: 'updated'},
        {label: 'Newest members', value: 'created'},
    ]

    const {filters, setFilters} = useFilterStore();

    const {gender, ageRange, orderBy} = filters;

    const genders = [
        {value: 'male', icon: FaMale},
        {value: 'female', icon: FaFemale},
    ]

    const handleAgeSelect = (value: number[]) => {
        const params = new URLSearchParams(searchParams);
        params.set('ageRange', value.join(','));
        router.replace(`${pathname}?${params}`);
    }

    const handleOrderSelect = (value: Selection) => {
        if(value instanceof Set) {
            const params = new URLSearchParams(searchParams);
            params.set('orderBy', value.values().next().value);
            router.replace(`${pathname}?${params}`);
        }
    }

    const handleGenderSelect = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if(selectedGender.includes(value)) {
            params.set('gender', selectedGender.filter(g => g !== value).toString())
        }else{
            params.set('gender', [...selectedGender, value].toString())
        }
        router.replace(`${pathname}?${params}`);

    }
}