"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function TestAuth() {
  const { user, loading, isAuthenticated } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSessionInfo({
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: error?.message,
        accessToken: session?.access_token ? 'Present' : 'Missing',
        refreshToken: session?.refresh_token ? 'Present' : 'Missing',
      });
    };

    checkSession();
    
    // Check localStorage
    const storageKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || key.includes('auth')
    );
    console.log('Storage keys:', storageKeys);
    
    // Increment refresh count
    const count = parseInt(sessionStorage.getItem('refreshCount') || '0');
    setRefreshCount(count + 1);
    sessionStorage.setItem('refreshCount', String(count + 1));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Page Refresh Info</h2>
          <p>Refresh count this session: {refreshCount}</p>
          <p className="text-sm text-gray-600 mt-2">
            Press F5 to test hard refresh. The count should increase and auth should persist.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Auth Context Status</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            <p><strong>User:</strong> {user ? `${user.email} (${user.role})` : 'None'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Supabase Session</h2>
          {sessionInfo && (
            <div className="space-y-2">
              <p><strong>Has Session:</strong> {sessionInfo.hasSession ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User ID:</strong> {sessionInfo.userId || 'None'}</p>
              <p><strong>Email:</strong> {sessionInfo.email || 'None'}</p>
              <p><strong>Access Token:</strong> {sessionInfo.accessToken}</p>
              <p><strong>Refresh Token:</strong> {sessionInfo.refreshToken}</p>
              {sessionInfo.error && (
                <p className="text-red-600"><strong>Error:</strong> {sessionInfo.error}</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Soft Refresh (location.reload)
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Storage & Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
