import cloudinary from "cloudinary";

// Define an asynchronous function to handle POST requests
export async function POST(request: Request) {
    // Parse the JSON body of the request to extract the paramsToSign object
    const body = (await request.json()) as { paramsToSign: Record<string, string> };
    const { paramsToSign } = body;

    // Generate a signature using Cloudinary's API utility function
    // The signature is created using the paramsToSign object and the Cloudinary API secret
    const signature = cloudinary.v2.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);

    // Return the generated signature as a JSON response
    return Response.json({ signature });
}