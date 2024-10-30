import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const s3config = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  region: process.env.S3_REGION || "ap-south-1",
});




const uploadS3Video = async (file: any) => {
  console.log("s3", process.env.S3_ACCESS_KEY );
console.log("s3", process.env.S3_SECRET_ACCESS_KEY );
console.log("s3", process.env.COURSE_BUCKET_NAME);
console.log("s3", file);
  const params = {
    Bucket: process.env.COURSE_BUCKET_NAME,
    Key: Date.now().toString() + "-" + file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentDisposition: "inline",
  };

  console.log("uploading video: ", params);
  return new Upload({
    client: s3config,
    params: params,
  })
    .done()
    .then((data) => {
      console.log("data from bucket", data);
      return data;
    })
    .catch((err) => {
      return { error: true, msg: err };
    });
};


export { uploadS3Video };