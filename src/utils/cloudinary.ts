import cloudinary from 'cloudinary';


console.log(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)
// Initialize Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

// Function to upload image to Cloudinary
export const uploadImageToCloudinary = async (file: Blob): Promise<string | null> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

        const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        return data.secure_url; // Return the secure URL of the uploaded image
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        console.log(error)
        return null;
    }
};

// Function to upload video to Cloudinary
export const uploadVideoToCloudinary = async (file: Blob): Promise<string | null> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

        const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        return data.secure_url; // Return the secure URL of the uploaded image
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        console.log(error)
        return null;
    }
};



export const fetchUrlsCloudinary = async () => {
    const url = `https://skyestudio-backend.onrender.com/extract-cloudinary-urls`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            // headers: {
            //     'Authorization': `Basic ${btoa(`${process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY}:${process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET}`)}`
            // }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data && data.length > 0 && data[0].cloudinaryURLs) {
            return data[0].cloudinaryURLs;
        } else {
            throw new Error('No data or invalid data format received');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
};



// Function to upload video to Cloudinary
export const uploadAudioToCloudinary = async (file: Blob): Promise<string | null> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

        const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        return data.secure_url; // Return the secure URL of the uploaded image
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        console.log(error)
        return null;
    }
};

