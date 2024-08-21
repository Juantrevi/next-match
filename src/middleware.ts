import {auth} from "@/auth";
import {authRoutes, publicRoutes} from "@/routes";
import {NextResponse} from "next/server";

// Export a default function that uses the auth function to handle authentication
export default auth((req) => {
    // Extract the nextUrl property from the req object
    const {nextUrl} = req;

    // Check if the user is logged in by checking if req.auth is truthy
    const isLoggedIn = !!req.auth;

    // Check if the current route is a public route
    const isPublic = publicRoutes.includes(nextUrl.pathname);

    // Check if the current route is an auth route
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    const isProfileComplete = req.auth?.user.profileComplete;

    const isAdmin = req.auth?.user.role === 'ADMIN';

    const isAdminRoute = nextUrl.pathname.startsWith('/admin');

    // If the current route is a public route, continue to the next middleware or route handler
    if (isPublic || isAdmin) {
        return NextResponse.next();
    }

    // If the current route is an auth route and the user is logged in, redirect to the '/members' page
    // If the user is not logged in, continue to the next middleware or route handler
    if (isAuthRoute){
        if (isLoggedIn){
            return NextResponse.redirect(new URL('/members', nextUrl));
        }
        return NextResponse.next();
    }

    // If the current route is not a public route and the user is not logged in, redirect to the '/login' page
    if(!isPublic && !isLoggedIn){
        return NextResponse.redirect(new URL('/login', nextUrl));
    }

    if (isAdminRoute && !isAdmin){
        return NextResponse.redirect(new URL('/', nextUrl));
    }

    if(isLoggedIn && !isProfileComplete && nextUrl.pathname !== '/complete-profile'){
        return NextResponse.redirect(new URL('/complete-profile', nextUrl));
    }

    // If none of the above conditions are met, continue to the next middleware or route handler
    return NextResponse.next();
})

// Export a config object that specifies the routes that this middleware should be applied to
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)']
}