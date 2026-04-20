import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { workspacesAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);
const STORAGE_KEY = 'taskora:currentWorkspaceId';

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
};

export const WorkspaceProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(
    () => localStorage.getItem(STORAGE_KEY) || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workspacesAPI.list();
      const list = res.data.workspaces || [];
      setWorkspaces(list);

      setCurrentWorkspaceId((prev) => {
        if (prev && list.some((w) => w._id === prev)) return prev;
        const next = user?.defaultWorkspace || list[0]?._id || null;
        if (next) localStorage.setItem(STORAGE_KEY, next);
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  }, [user?.defaultWorkspace]);

  useEffect(() => {
    if (isAuthenticated) {
      loadWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspaceId(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isAuthenticated, loadWorkspaces]);

  const switchWorkspace = useCallback((workspaceId) => {
    if (!workspaceId) return;
    localStorage.setItem(STORAGE_KEY, workspaceId);
    setCurrentWorkspaceId(workspaceId);
  }, []);

  const createWorkspace = useCallback(async (name) => {
    const res = await workspacesAPI.create({ name });
    const ws = res.data.workspace;
    setWorkspaces((prev) => [
      ...prev,
      { _id: ws._id, name: ws.name, slug: ws.slug, plan: ws.plan, role: 'owner' },
    ]);
    localStorage.setItem(STORAGE_KEY, ws._id);
    setCurrentWorkspaceId(ws._id);
    return ws;
  }, []);

  const currentWorkspace = workspaces.find((w) => w._id === currentWorkspaceId) || null;

  const value = {
    workspaces,
    currentWorkspace,
    currentWorkspaceId,
    loading,
    error,
    switchWorkspace,
    createWorkspace,
    refreshWorkspaces: loadWorkspaces,
    role: currentWorkspace?.role || null,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const getCurrentWorkspaceId = () => localStorage.getItem(STORAGE_KEY);
