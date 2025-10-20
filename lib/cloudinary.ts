import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with environment variables or fallback
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dxuoorngr'
const apiKey = process.env.CLOUDINARY_API_KEY || '398549741265532'
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'KYvB8SBzGdgT3Ae424brlR7yjxw'

console.log('🔧 Cloudinary Config:', {
	cloud_name: cloudName,
	api_key: apiKey ? `${apiKey.substring(0, 8)}...` : 'not set',
	api_secret: apiSecret ? `${apiSecret.substring(0, 8)}...` : 'not set'
})

cloudinary.config({
	cloud_name: cloudName,
	api_key: apiKey,
	api_secret: apiSecret,
})

export interface UploadResult {
	url: string
	public_id: string
	secure_url: string
}

export async function uploadToCloudinary(
  file: Buffer,
  filename: string,
  folder: string = 'djyh-products',
  resourceType: 'image' | 'auto' = 'image'
): Promise<UploadResult> {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: folder,
				public_id: filename.replace(/\.[^/.]+$/, ''),
				resource_type: resourceType,
				...(resourceType === 'image'
					? {
						transformation: [
							{ width: 800, height: 800, crop: 'limit' },
							{ quality: 'auto' }
						]
					}
					: {})
			},
			(error, result) => {
				if (error) {
					reject(error)
				} else if (result) {
					resolve({
						url: result.secure_url,
						public_id: result.public_id,
						secure_url: result.secure_url
					})
				} else {
					reject(new Error('No result from Cloudinary'))
				}
			}
		)

		uploadStream.end(file)
	})
}

export async function uploadAvatarToCloudinary(file: Buffer, filename: string): Promise<UploadResult> {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: 'djyh-avatars',
				public_id: filename.replace(/\.[^/.]+$/, ''),
				resource_type: 'image',
				transformation: [
					{ width: 400, height: 400, crop: 'fill', gravity: 'face' },
					{ quality: 'auto' }
				]
			},
			(error, result) => {
				if (error) {
					reject(error)
				} else if (result) {
					resolve({
						url: result.secure_url,
						public_id: result.public_id,
						secure_url: result.secure_url
					})
				} else {
					reject(new Error('No result from Cloudinary'))
				}
			}
		)

		uploadStream.end(file)
	})
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
	return new Promise((resolve, reject) => {
		cloudinary.uploader.destroy(publicId, (error) => {
			if (error) {
				reject(error)
			} else {
				resolve()
			}
		})
	})
}
