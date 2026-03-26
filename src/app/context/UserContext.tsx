'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserBirthData {
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
}

export interface BaziResult {
  bazi: {
    year: string;
    month: string;
    day: string;
    hour: string;
    riZhu: string;
    wuXing: Record<string, string>;
    yinYang: Record<string, string>;
  };
  detail: any;
  daYun: Array<{ age: number; ganZhi: string }>;
  liuNian: Array<{ year: number; ganZhi: string }>;
  aiAnalysis?: {
    mingZhu: string;
    career: string;
    wealth: string;
    love: string;
    health: string;
    currentPeriod: string;
    thisYear: string;
    advice: string;
    score: {
      career: number;
      wealth: number;
      love: number;
      health: number;
      overall: number;
    };
  };
  kline?: any[];
}

interface UserContextType {
  birthData: UserBirthData | null;
  setBirthData: (data: UserBirthData) => void;
  baziResult: BaziResult | null;
  setBaziResult: (result: BaziResult | null) => void;
  hasData: boolean;
  clearData: () => void;
}

const STORAGE_KEY = 'oracle_user_data';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [birthData, setBirthDataState] = useState<UserBirthData | null>(null);
  const [baziResult, setBaziResultState] = useState<BaziResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载数据
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.birthData && parsed.baziResult) {
          setBirthDataState(parsed.birthData);
          setBaziResultState(parsed.baziResult);
        }
      }
    } catch (error) {
      console.error('Failed to load user data from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // 保存到 localStorage
  const saveToStorage = (data: UserBirthData | null, result: BaziResult | null) => {
    try {
      if (data && result) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          birthData: data,
          baziResult: result,
          savedAt: new Date().toISOString(),
        }));
      }
    } catch (error) {
      console.error('Failed to save user data to localStorage:', error);
    }
  };

  const setBirthData = (data: UserBirthData) => {
    setBirthDataState(data);
    // 不立即保存，等 setBaziResult 一起保存
  };

  const setBaziResult = (result: BaziResult | null) => {
    setBaziResultState(result);
    if (result && birthData) {
      saveToStorage(birthData, result);
    }
  };

  const clearData = () => {
    setBirthDataState(null);
    setBaziResultState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // 如果数据已加载但 baziResult 有更新，保存到 storage
  useEffect(() => {
    if (isLoaded && birthData && baziResult) {
      saveToStorage(birthData, baziResult);
    }
  }, [baziResult, isLoaded]);

  if (!isLoaded) {
    return null; // 或者返回 loading 组件
  }

  return (
    <UserContext.Provider
      value={{
        birthData,
        setBirthData,
        baziResult,
        setBaziResult,
        hasData: !!birthData && !!baziResult,
        clearData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
