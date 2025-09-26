import React, { createContext, ReactNode, useContext, useState } from 'react';

type ProblemData = {
    titulo?: string;
    descricao?: string;
    tipo?: string;
    dataOcorrencia?: Date;
    localizacao?: {
        latitude: number;
        longitude: number;
    };
    fotos ?: string[];
};

type ProblemContextType = {
    data: ProblemData;
    setData: React.Dispatch<React.SetStateAction<ProblemData>>;
};

const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

export function ProblemProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<ProblemData>({});

    return (
        <ProblemContext.Provider value={{ data, setData }}>
            {children}
        </ProblemContext.Provider>
    );
}

export function useProblem() {
    const context = useContext(ProblemContext);
    if (!context) throw new Error('useProblem must be used within ProblemProvider');
    return context;
}
