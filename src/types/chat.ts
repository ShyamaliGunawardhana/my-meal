export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  imageUri?: string;
}
