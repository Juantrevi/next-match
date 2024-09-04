// This component fetches the user's session data and displays it.
// If the user is signed in, it shows the session data.
// If the user is not signed in, it shows a message indicating that the user is not signed in.
// It also includes a `ClientSession` component to display client-side session data.

import {auth, signOut} from "@/auth"; // Import authentication functions
import ClientSession from "@/components/ClientSession"; // Import ClientSession component

export default async function Home() {
    const session = await auth(); // Fetch the user's session data

    return (
        <div className={'flex flex-row justify-around mt-20 gap-6'}>
            <div className={'bg-green-50 p-10 rounded-xl shadow-md w-1/2 overflow-auto'}>
                { session ? (
                    <div>
                        <h3 className='text-2xl font-semibold'>Server session data: </h3>
                        <pre>{ JSON.stringify(session, null, 2) }</pre> {/* Display session data */}
                    </div>
                ) : (
                    <div>
                        <p>Not signed in</p> {/* Display message if not signed in */}
                    </div>
                )}
            </div>
            <ClientSession /> {/* Display client-side session data */}
        </div>
    );
}