'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
}

interface UseCloudSyncOptions {
  enabled?: boolean;
  autoSync?: boolean;
  syncInterval?: number; // 毫秒
}

/**
 * 云端数据同步 Hook
 * 用于将 localStorage 数据同步到云端数据库
 */
export function useCloudSync(options: UseCloudSyncOptions = {}) {
  const { enabled = true, autoSync = true, syncInterval = 5 * 60 * 1000 } = options;
  const { data: session, status } = useSession();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
  });

  const isAuthenticated = status === 'authenticated' && session?.user;

  /**
   * 同步本地数据到云端
   */
  const syncToCloud = useCallback(async () => {
    if (!isAuthenticated || !enabled) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // 获取本地数据
      const localData = localStorage.getItem('oracle_user_data');
      if (!localData) {
        setSyncStatus(prev => ({ ...prev, isSyncing: false }));
        return;
      }

      const parsed = JSON.parse(localData);
      if (!parsed.birthData || !parsed.baziResult) {
        setSyncStatus(prev => ({ ...prev, isSyncing: false }));
        return;
      }

      // 发送到云端
      const response = await fetch('/api/readings/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: parsed.birthData.name,
          gender: parsed.birthData.gender,
          birthDate: parsed.birthData.birthDate,
          birthTime: parsed.birthData.birthTime,
          birthPlace: parsed.birthData.birthPlace,
          country: parsed.birthData.country,
          province: parsed.birthData.province,
          city: parsed.birthData.city,
          district: parsed.birthData.district,
          baziData: parsed.baziResult.detail,
          daYun: { 大运: parsed.baziResult.daYun, 起运年龄: 3 }, // TODO: 计算真实起运年龄
          liuNian: parsed.baziResult.liuNian,
          aiAnalysis: parsed.baziResult.aiAnalysis,
          baseScores: parsed.baziResult.aiAnalysis?.score,
          klineData: parsed.baziResult.kline,
        }),
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const result = await response.json();
      
      setSyncStatus({
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
      });

      return result.data;
    } catch (error) {
      console.error('Cloud sync error:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, [isAuthenticated, enabled]);

  /**
   * 从云端获取数据
   */
  const fetchFromCloud = useCallback(async () => {
    if (!isAuthenticated || !enabled) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const response = await fetch('/api/readings/bazi?limit=20');
      
      if (!response.ok) {
        throw new Error('Fetch failed');
      }

      const result = await response.json();
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date(),
        error: null,
      }));

      return result.data;
    } catch (error) {
      console.error('Fetch from cloud error:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Fetch failed',
      }));
    }
  }, [isAuthenticated, enabled]);

  /**
   * 合并本地和云端数据
   */
  const mergeData = useCallback(async () => {
    const cloudData = await fetchFromCloud();
    const localData = localStorage.getItem('oracle_user_data');
    
    if (!cloudData && !localData) return;
    
    // TODO: 实现更复杂的合并逻辑（基于时间戳）
    // 目前简单策略：如果云端有数据，优先使用云端
    
    if (cloudData && cloudData.length > 0) {
      // 云端有数据，更新本地
      const latest = cloudData[0];
      localStorage.setItem('oracle_user_data', JSON.stringify({
        birthData: {
          name: latest.name,
          gender: latest.gender.toLowerCase(),
          birthDate: latest.birthDate,
          birthTime: latest.birthTime,
          birthPlace: latest.birthPlace,
          country: latest.country,
          province: latest.province,
          city: latest.city,
          district: latest.district,
        },
        baziResult: {
          bazi: latest.baziData?.八字,
          detail: latest.baziData,
          daYun: latest.daYun?.大运,
          liuNian: latest.liuNian,
          aiAnalysis: latest.aiAnalysis,
          kline: latest.klineData,
        },
        syncedAt: new Date().toISOString(),
      }));
    } else if (localData) {
      // 本地有数据，同步到云端
      await syncToCloud();
    }
  }, [fetchFromCloud, syncToCloud]);

  // 自动同步
  useEffect(() => {
    if (!autoSync || !isAuthenticated) return;

    // 初始同步
    mergeData();

    // 定时同步
    const interval = setInterval(() => {
      syncToCloud();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, isAuthenticated, syncInterval, mergeData, syncToCloud]);

  // 监听登录状态变化
  useEffect(() => {
    if (isAuthenticated) {
      mergeData();
    }
  }, [isAuthenticated, mergeData]);

  return {
    syncStatus,
    syncToCloud,
    fetchFromCloud,
    mergeData,
    isAuthenticated,
  };
}
