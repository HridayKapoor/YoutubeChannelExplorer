
export interface Folder {
  id: string;
  name: string;
  channelIds: string[];
}

export interface FolderContextType {
  folders: Folder[];
  addFolder: (name: string) => void;
  addChannelToFolder: (folderId: string, channelId: string) => void;
  removeChannelFromFolder: (folderId: string, channelId: string) => void;
  deleteFolder: (folderId: string) => void;
}
