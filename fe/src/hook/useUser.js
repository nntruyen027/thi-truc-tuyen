import {useQuery} from "@tanstack/react-query";
import {authFetch} from "@/utils/fetcher";

export function useUser() {
    return useQuery({
        queryKey: ["me"],
        queryFn: () => authFetch(`${process.env.NEXT_PUBLIC_BE}/auth/me`),
        enabled: false
    });
}
