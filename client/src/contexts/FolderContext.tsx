
import { createContext, useContext, useState, useEffect } from 'react';
import type { Folder, FolderContextType } from '@/lib/types';

const FolderContext = createContext<FolderContextType | null>(null);

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('channel-folders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('channel-folders', JSON.stringify(folders));
  }, [folders]);

  const addFolder = (name: string) => {
    setFolders(prev => [...prev, { id: crypto.randomUUID(), name, channelIds: [] }]);
  };

  const addChannelToFolder = (folderId: string, channelId: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, channelIds: [...folder.channelIds, channelId] }
        : folder
    ));
  };

  const removeChannelFromFolder = (folderId: string, channelId: string) => {
    setFolders(prev => prev.map(folder =>
      folder.id === folderId
        ? { ...folder, channelIds: folder.channelIds.filter(id => id !== channelId) }
        : folder
    ));
  };

  const deleteFolder = (folderId: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
  };

  return (
    <FolderContext.Provider value={{
      folders,
      addFolder,
      addChannelToFolder,
      removeChannelFromFolder,
      deleteFolder
    }}>
      {children}
    </FolderContext.Provider>
  );
}

export function useFolders() {
  const context = useContext(FolderContext);
  if (!context) throw new Error('useFolders must be used within FolderProvider');
  return context;
}
