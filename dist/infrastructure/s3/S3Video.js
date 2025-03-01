"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadS3Video = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3config = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
    region: process.env.S3_REGION || "ap-south-1",
});
const uploadS3Video = (file) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("s3", process.env.S3_ACCESS_KEY);
    console.log("s3", process.env.S3_SECRET_ACCESS_KEY);
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
    return new lib_storage_1.Upload({
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
});
exports.uploadS3Video = uploadS3Video;
