import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDb } from "@/lib/db";
import FileAsset from "@/models/FileAsset";
import { FileUploadForm } from "./upload-form";
import { DeleteFileButton } from "./delete-button";
export default async function FilesAdmin(){ const session=await auth(); if(!session?.user?.email||session.user.email.toLowerCase()!==process.env.ADMIN_EMAIL?.toLowerCase())redirect("/admin/login"); await connectDb(); const files=await FileAsset.find().sort({createdAt:-1}).lean(); return <><h1>Files and media</h1><p>PDF files up to 5 MB and PNG, JPG or WEBP images up to 3 MB. “On approved request” files are delivered only through a valid access link.</p><FileUploadForm/><section className="section"><h2>Uploaded files</h2>{files.length?<div className="grid">{files.map((file)=><article className="card" key={String(file._id)}><h3>{file.title}</h3><p>{file.type} · {file.visibility} · {(file.size/1024/1024).toFixed(2)} MB</p>{file.visibility==="public"&&<p><Link href={`/api/files/public/${file.fileKey}`} target="_blank">Open public file</Link></p>}<DeleteFileButton id={String(file._id)}/></article>)}</div>:<p>No files uploaded.</p>}</section><p><Link href="/admin">← Dashboard</Link></p></>; }
