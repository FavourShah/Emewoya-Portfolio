import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config.js';

if (config.cloudinary.cloudName && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

/**
 * Sign an upload request for Cloudinary
 * @param {string} folder
 * @returns {{ timestamp: number, signature: string, apiKey: string, cloudName: string, folder: string }}
 */
export function signUpload(folder = 'portfolio') {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    config.cloudinary.apiSecret || 'dev_secret'
  );

  return {
    timestamp,
    signature,
    apiKey: config.cloudinary.apiKey,
    cloudName: config.cloudinary.cloudName,
    folder,
  };
}

