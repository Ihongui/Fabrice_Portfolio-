"use client";
import { useState } from "react";
export function DeleteFileButton({ id }: {id:string}) { const [message,setMessage]=useState(""); async function remove(){ if(!window.confirm("Delete this file permanently?"))return; const response=await fetch(`/api/admin/files?id=${encodeURIComponent(id)}`,{method:"DELETE"}); if(response.ok)window.location.reload(); else setMessage("Could not delete this file."); } return <><button className="button secondary" onClick={remove}>Delete</button><span role="status">{message}</span></>; }
