'use client'

import {useSession} from "next-auth/react";



export default function ClientSession() {
    const session = useSession();
    return (
        <div className={'bg-blue-50 p-10 rounded-xl shadow-md w-1/2 overflow-auto'}>
            {session ? (
                <div>
                    <h3 className='text-2xl font-semibold'>Client session data: </h3>
                    <pre>{JSON.stringify(session, null, 2)}</pre>
                </div>
            ) : (
                <div>
                    <p>Not signed in</p>
                </div>
            )}
        </div>
    );
};