// Import necessary modules and types
import {MessageDto} from "@/types";
import {create} from "zustand";
import {devtools} from "zustand/middleware";

// Define the shape of the message state
type MessageState = {
    message: MessageDto[]; // Array of message objects
    unreadCount: number; // Number of unread messages
    add: (message: MessageDto) => void; // Function to add a new message
    remove: (id: string) => void; // Function to remove a message by its ID
    set: (message: MessageDto[]) => void; // Function to replace the entire message array
    updateUnreadCount: (amount: number) => void; // Function to update the unread count

};

// Create the useMessageStore hook with Zustand
const useMessageStore = create<MessageState>()(devtools((set) => ({
    message: [], // Initial state: an empty array of messages
    unreadCount: 0, // Initial state: zero unread messages
    add: (message) => set(state => ({message: [message, ...state.message]})), // Add a message to the beginning of the array
    remove: (id) => set(state => ({message: state.message.filter((m: MessageDto) => m.id !== id)})), // Remove a message by ID
    set: (message) => set({message}), // Replace the entire message array
    updateUnreadCount: (amount: number) => set(state => ({unreadCount: state.unreadCount + amount})) // Update the unread count
}), {name: 'messageStoreDemo'})); // Use devtools middleware for debugging

// Export the hook for use in other parts of the application
export default useMessageStore;