import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {API_BASE_URL} from "~/config/env";
import {useAuthStore} from "~/store/auth";

export function useUser() {
    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const {access} = useAuthStore.getState();

            const response = await axios.get(
                `${API_BASE_URL}/auth/me`,
                {
                    headers: access
                        ? {Authorization: `Bearer ${access}`}
                        : {},
                }
            );

            return response.data;
        },
        enabled: false
    });
}
