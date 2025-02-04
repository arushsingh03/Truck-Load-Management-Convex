import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

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
    if (!UPLOAD_PRESET_RECEIPTS) {
        throw new Error('Cloudinary receipts upload preset is not configured');
    }

    console.log('Environment:', {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        uploadPresetReceipts: UPLOAD_PRESET_RECEIPTS,
        buildEnv: __DEV__ ? 'Development' : 'Production',
        platform: Platform.OS
    });
};

export const uploadToCloudinary = async (uri: string): Promise<string | null> => {
    try {
        validateConfig();
        console.log('Starting upload process for:', uri);

        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('File info:', fileInfo);

        if (!fileInfo.exists) {
            throw new Error(`File does not exist at path: ${uri}`);
        }

        let finalUri = uri;
        if (Platform.OS === 'ios' && !uri.startsWith('file://')) {
            finalUri = `file://${uri}`;
        }

        console.log('Reading file as base64...');
        const base64 = await FileSystem.readAsStringAsync(finalUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const fileExtension = finalUri.split('.').pop()?.toLowerCase() || '';
        const mimeType = getMimeType(fileExtension);
        console.log('File type:', { extension: fileExtension, mimeType });

        const formData = new FormData();
        formData.append('file', `data:${mimeType};base64,${base64}`);
        formData.append('upload_preset', UPLOAD_PRESET!);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
        console.log('Uploading to Cloudinary...');

        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });

        const responseText = await response.text();
        console.log('Cloudinary response status:', response.status);

        if (!response.ok) {
            throw new Error(`Upload failed (${response.status}): ${responseText}`);
        }

        try {
            const data = JSON.parse(responseText);
            console.log('Upload successful:', data.secure_url);
            return data.secure_url;
        } catch (parseError) {
            throw new Error(`Failed to parse response: ${responseText}`);
        }

    } catch (error) {
        console.error('Upload error details:', {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : 'Unknown error',
            uri: uri,
            cloudName: CLOUDINARY_CLOUD_NAME,
            buildEnv: __DEV__ ? 'Development' : 'Production'
        });
        throw error;
    }
};

export const uploadReceiptToCloudinary = async (uri: string): Promise<{ url: string; publicId: string } | null> => {
    try {
        validateConfig();
        console.log('Starting receipt upload for:', uri);

        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('Receipt file info:', fileInfo);

        if (!fileInfo.exists) {
            throw new Error(`Receipt file does not exist at path: ${uri}`);
        }

        let finalUri = uri;
        if (Platform.OS === 'ios' && !uri.startsWith('file://')) {
            finalUri = `file://${uri}`;
        }

        console.log('Reading receipt as base64...');
        const base64 = await FileSystem.readAsStringAsync(finalUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const fileExtension = finalUri.split('.').pop()?.toLowerCase() || '';
        const mimeType = getMimeType(fileExtension);
        console.log('Receipt file type:', { extension: fileExtension, mimeType });

        const formData = new FormData();
        formData.append('file', `data:${mimeType};base64,${base64}`);
        formData.append('upload_preset', UPLOAD_PRESET_RECEIPTS!);
        formData.append('folder', 'OmMotors/Receipts');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
        console.log('Uploading receipt to Cloudinary...');

        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });

        const responseText = await response.text();
        console.log('Cloudinary receipt response status:', response.status);

        if (!response.ok) {
            throw new Error(`Receipt upload failed (${response.status}): ${responseText}`);
        }

        try {
            const data = JSON.parse(responseText);
            console.log('Receipt upload successful:', {
                url: data.secure_url,
                publicId: data.public_id
            });
            return {
                url: data.secure_url,
                publicId: data.public_id
            };
        } catch (parseError) {
            throw new Error(`Failed to parse receipt response: ${responseText}`);
        }

    } catch (error) {
        console.error('Receipt upload error details:', {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : 'Unknown error',
            uri: uri,
            cloudName: CLOUDINARY_CLOUD_NAME,
            buildEnv: __DEV__ ? 'Development' : 'Production'
        });
        throw error;
    }
};