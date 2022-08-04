import aws from "aws-sdk";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const s3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    });

    aws.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
      signatureVersion: "v4",
    });

    const post = s3.createPresignedPost({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Fields: {
        key: req.query.file,
      },
      Expires: 60, // seconds
      Conditions: [
        ["content-length-range", 0, 5048576], // up to 1 MB
      ],
    });

    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
  }
}
