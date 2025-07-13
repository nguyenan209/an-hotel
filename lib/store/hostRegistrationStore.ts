import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HostRegistrationData {
  registrationId: string;
  fullName: string;
  email: string;
  phone: string;
  homestayAddress: string;
  experience: string;
  packageType: string;
  paymentId: string;
  clientSecret: string;
  amount: number;
  currentStep: number;
}

interface HostRegistrationState {
  registrationData: HostRegistrationData;
  isLoading: boolean;
  
  // Actions
  setRegistrationData: (data: Partial<HostRegistrationData>) => void;
  updateStep: (stepData: Partial<HostRegistrationData>) => void;
  setCurrentStep: (step: number) => void;
  clearRegistrationData: () => void;
  setLoading: (loading: boolean) => void;
}

const initialData: HostRegistrationData = {
  registrationId: "",
  fullName: "",
  email: "",
  phone: "",
  homestayAddress: "",
  experience: "",
  packageType: "Cơ bản",
  paymentId: "",
  clientSecret: "",
  amount: 500000,
  currentStep: 1,
};

export const useHostRegistrationStore = create<HostRegistrationState>()(
  persist(
    (set, get) => ({
      registrationData: initialData,
      isLoading: false,

      setRegistrationData: (data) => {
        set((state) => ({
          registrationData: {
            ...state.registrationData,
            ...data,
          },
        }));
      },

      updateStep: (stepData) => {
        set((state) => ({
          registrationData: {
            ...state.registrationData,
            ...stepData,
            currentStep: state.registrationData.currentStep + 1,
          },
        }));
      },

      setCurrentStep: (step) => {
        set((state) => ({
          registrationData: {
            ...state.registrationData,
            currentStep: step,
          },
        }));
      },

      clearRegistrationData: () => {
        set({
          registrationData: initialData,
          isLoading: false,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "host-registration-storage",
      partialize: (state) => ({
        registrationData: state.registrationData,
      }),
    }
  )
); 