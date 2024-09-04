// This function handles the POST request for Pusher authentication.
// It checks the user's session, retrieves the socket ID and channel name from the request body, and authorizes the channel using Pusher.

import {auth} from "@/auth";
import {pusherServer} from "@/lib/pusher";
import {NextResponse} from "next/server";

export async function POST(request: Request){
    try {
        const session = await auth(); // Authenticate the user

        if (!session?.user?.id) {
            return new Response('Unauthorized', {status: 401}); // Return 401 if user is not authenticated
        }

        const body = await request.formData(); // Get form data from the request

        const socketId = body.get('socket_id') as string; // Retrieve socket ID
        const channel = body.get('channel_name') as string; // Retrieve channel name

        const data = {
            user_id: session.user.id, // User ID for Pusher authentication
        }

        const authResponse = pusherServer.authorizeChannel(socketId, channel, data); // Authorize the channel

        return NextResponse.json(authResponse) // Return the authorization response

    }catch (error) {
        console.error('Error in Pusher auth:', error); // Log any errors
        return new Response('Internal Server Error', { status: 500 }); // Return 500 if an error occurs
    }
}