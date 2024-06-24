import {auth, signOut} from "@/auth";


export default async function Home() {

    const session = await auth();

  return (
      <div>
          { session ? (
              <div>
                  <h3 className='text-2xl font-semibold'>User session data: </h3>
                  <pre>{ JSON.stringify(session, null, 2) }</pre>
              </div>
          ) : (
                <div>
                    <p>Not signed in</p>
                </div>
          )}

      </div>
  );
}
