import * as FileSystem from 'expo-file-system';

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_PESETS;
const UPLOAD_PRESET_RECEIPTS = process.env.EXPO_PUBLIC_CLOUDINARY_PESETS_RECEIPTS;

const getMimeType = (extension: string): string => {
    const mimeTypes: { [key: string]: string } = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

const validateConfig = () => {
    if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error('Cloudinary cloud name is not configured');
    }
    if (!UPLOAD_PRESET) {
        throw new Error('Cloudinary upload preset is not configured');
    }
    console.log('Config validation - Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('Config validation - Upload Preset:', UPLOAD_PRESET);
};

export const uploadToCloudinary = async (uri: string): Promise<string | null> => {
    try {
        validateConfig();

        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
            console.error('File does not exist');
            return null;
        }

        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const fileExtension = uri.split('.').pop()?.toLowerCase() || '';
        const mimeType = getMimeType(fileExtension);

        const formData = new FormData();
        formData.append('file', `data:${mimeType};base64,${base64}`);
        formData.append('upload_preset', UPLOAD_PRESET!);

        console.log('Starting Cloudinary upload...');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
        console.log('Upload URL:', uploadUrl);

        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary error response:', JSON.stringify(errorData, null, 2));
            throw new Error(`Upload failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('Upload successful:', data.secure_url);
        return data.secure_url;

    } catch (error) {
        console.error('Detailed upload error:', error);
        return null;
    }
};

export const uploadReceiptToCloudinary = async (uri: string): Promise<{ url: string; publicId: string } | null> => {
    try {
        validateConfig();

        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
            console.error('File does not exist');
            return null;
        }

        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const fileExtension = uri.split('.').pop()?.toLowerCase() || '';
        const mimeType = getMimeType(fileExtension);

        const formData = new FormData();
        formData.append('file', `data:${mimeType};base64,${base64}`);
        formData.append('upload_preset', UPLOAD_PRESET_RECEIPTS!);
        formData.append('OmMotors/Receipts', 'receipts');

        console.log('Starting receipt upload to Cloudinary...');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary error response:', JSON.stringify(errorData, null, 2));
            throw new Error(`Upload failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('Receipt upload successful:', data.secure_url);
        return {
            url: data.secure_url,
            publicId: data.public_id
        };

    } catch (error) {
        console.error('Receipt upload error:', error);
        return null;
    }
};
