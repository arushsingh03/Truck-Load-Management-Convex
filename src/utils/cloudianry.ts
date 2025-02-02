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

    console.log('Build Environment:', __DEV__ ? 'Development' : 'Production');
    console.log('Platform:', Platform.OS);
    console.log('Config validation - Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('Config validation - Upload Preset:', UPLOAD_PRESET);
};

export const uploadToCloudinary = async (uri: string): Promise<string | null> => {
    try {
        validateConfig();

        console.log('Initial file URI:', uri);

        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('File info:', fileInfo);

        if (!fileInfo.exists) {
            console.error('File does not exist at path:', uri);
            return null;
        }

        let finalUri = uri;
        if (Platform.OS === 'ios' && !uri.startsWith('file://')) {
            finalUri = `file://${uri}`;
        }

        const base64 = await FileSystem.readAsStringAsync(finalUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const fileExtension = finalUri.split('.').pop()?.toLowerCase() || '';
        const mimeType = getMimeType(fileExtension);

        console.log('Preparing upload with mime type:', mimeType);

        const formData = new FormData();
        formData.append('file', `data:${mimeType};base64,${base64}`);
        formData.append('upload_preset', UPLOAD_PRESET!);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
        console.log('Starting upload to:', uploadUrl);

        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });

        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!response.ok) {
            console.error('Upload failed with status:', response.status);
            console.error('Response text:', responseText);
            throw new Error(`Upload failed: ${response.status} - ${responseText}`);
        }

        const data = JSON.parse(responseText);
        console.log('Upload successful:', data.secure_url);
        return data.secure_url;

    } catch (error) {
        console.error('Detailed upload error:', error);
        if (error instanceof Error) {
            console.error('Error stack:', error.stack);
        }
        return null;
    }
};

export const uploadReceiptToCloudinary = async (uri: string): Promise<{ url: string; publicId: string } | null> => {
    try {
        validateConfig();

        console.log('Initial receipt file URI:', uri);

        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('Receipt file info:', fileInfo);

        if (!fileInfo.exists) {
            console.error('Receipt file does not exist at path:', uri);
            return null;
        }

        let finalUri = uri;
        if (Platform.OS === 'ios' && !uri.startsWith('file://')) {
            finalUri = `file://${uri}`;
        }

        const base64 = await FileSystem.readAsStringAsync(finalUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const fileExtension = finalUri.split('.').pop()?.toLowerCase() || '';
        const mimeType = getMimeType(fileExtension);

        console.log('Preparing receipt upload with mime type:', mimeType);

        const formData = new FormData();
        formData.append('file', `data:${mimeType};base64,${base64}`);
        formData.append('upload_preset', UPLOAD_PRESET_RECEIPTS!);
        formData.append('folder', 'OmMotors/Receipts');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
        console.log('Starting receipt upload to:', uploadUrl);

        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });

        const responseText = await response.text();
        console.log('Raw receipt response:', responseText);

        if (!response.ok) {
            console.error('Receipt upload failed with status:', response.status);
            console.error('Response text:', responseText);
            throw new Error(`Receipt upload failed: ${response.status} - ${responseText}`);
        }

        const data = JSON.parse(responseText);
        console.log('Receipt upload successful:', data.secure_url);
        return {
            url: data.secure_url,
            publicId: data.public_id
        };

    } catch (error) {
        console.error('Detailed receipt upload error:', error);
        if (error instanceof Error) {
            console.error('Error stack:', error.stack);
        }
        return null;
    }
};