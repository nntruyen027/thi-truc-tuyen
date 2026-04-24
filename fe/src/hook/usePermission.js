import {useAuthStore} from "~/store/auth";

export function usePermission() {
    const {user} = useAuthStore()

    const role = user?.role || [];

    const isAdmin = () => {
        return role === 'admin' || role === 'super_admin';
    };

    const isSuperAdmin = () => {
        return role === 'super_admin';
    };

    return {
        isAdmin,
        isSuperAdmin
    };
}
