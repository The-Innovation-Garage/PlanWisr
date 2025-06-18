import { create } from 'zustand'

export const useUserStore = create((set) => ({
  isLogin: false,
  username: "",
  userId: "",
  email: "",
  fullName: "",
  attachments: [],
  uploadProgressCaption: "",
  attachmentProgress: 0,
  aiLimit: 0,
  IsPro: true,
  Projects: 0,
  SetProjects: (newState) => set({ Projects:newState}),
  SetAttachmentProgress: (newState) => set({ attachmentProgress:newState}),
  SetUploadProgressCaption: (newState) => set({ uploadProgressCaption:newState}),
  SetAttachments: (attachment) => {
    set((state) => ({
      attachments: [...state.attachments, attachment],
    }));
  },
  resetAttachments: () => set({ attachments: [] }),
  SetFullName: (newState) => set({ fullName:newState}),
  SetLastName: (newState) => set({ lastName:newState}),
  SetIsLogin: (newState) => set({ isLogin:newState}),
  SetUsername: (newState) => set({ username:newState}),
  SetUserId: (newState) => set({ userId:newState}),
  SetEmail: (newState) => set({ email:newState}),
  SetAiLimit: (newState) => set({ aiLimit:newState}),
  SetIsPro: (newState) => set({ IsPro:newState}),
}))