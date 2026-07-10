import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type SignupData = {
  email: string;
  username: string;
  password: string;
};

type SignupContextValue = SignupData & {
  setEmail: (email: string) => void;
  setCredentials: (username: string, password: string) => void;
  reset: () => void;
};

const initialData: SignupData = { email: "", username: "", password: "" };

const SignupContext = createContext<SignupContextValue | null>(null);

export function SignupProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SignupData>(initialData);

  const value = useMemo<SignupContextValue>(
    () => ({
      ...data,
      setEmail: (email) => setData((prev) => ({ ...prev, email })),
      setCredentials: (username, password) => setData((prev) => ({ ...prev, username, password })),
      reset: () => setData(initialData),
    }),
    [data]
  );

  return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>;
}

export function useSignup(): SignupContextValue {
  const context = useContext(SignupContext);
  if (!context) {
    throw new Error("useSignup must be used within a SignupProvider");
  }
  return context;
}
