import {useAuthStore} from "~/store/auth";

export function usePermission() {
    const {user} = useAuthStore()

    const role = user?.role || [];

    const isAdmin = () => {
        return role === 'admin';
    };

    return {
        isAdmin
    };
}
