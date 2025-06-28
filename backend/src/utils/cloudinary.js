import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"; // Importing the file system module to handle file operations

cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
})

/**  Function to upload a file to Cloudinary
 * @param {string} localFilePath - The local path of the file to be uploaded
 * @returns {Promise<Object>} - Returns a promise that resolves to the upload result
 */

const uploadOnCloudinary = async (localFilePath) => {
  try 
  {
    if(!localFilePath) 
    {
      throw new Error("No file path provided for upload");
    }
    // Upload the file to Cloudinary

    //Writing these 3 lines will also run the code but it will not delete the file after uploading
    const response = await cloudinary.uploader.upload( localFilePath , 
      {
        resource_type: "auto",
      }
    )
    //File upload successful, delete the local file
    //console.log("File uploaded successfully to Cloudinary",response.url); (written for testing purpose)

    //* We need to remove the local file after uploading it to Cloudinary
    fs.unlinkSync(localFilePath); //*removes the locally saved files after upload
    return response;
  }
  
  catch (error) 
  {
     //*removes the locally saved files as upload failed

     //* 🔥(((Fixed a bug where if the file upload fails, the local file was not being deleted))))🔥 (mu khali fs.unlinksync lekhuthili without if condition check ta jebe "undefined" asuthila postman peda heijauthila)
    if (localFilePath && fs.existsSync(localFilePath)) 
    {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
}



export { uploadOnCloudinary };