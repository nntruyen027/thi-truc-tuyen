import {create} from "zustand";

export const useModal = create((set) => ({
    isEditOpen: false,
    isUpdatePassOpen: false,
    role: null,

    setIsEditOpen: (role) => set({role, isEditOpen: true}),

    setIsEditClose: () => set({isEditOpen: false, role: null}),

    SetIsUpdatePassOpen: () => set({isUpdatePassOpen: true}),

    SetIsUpdatePassClose: () => set({isUpdatePassOpen: false}),
}));
