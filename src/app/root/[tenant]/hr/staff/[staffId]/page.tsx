import { redirect } from "next/navigation"; export default async function Page({params}:{params:Promise<{staffId:string}>}){const{staffId}=await params;redirect(`/hr/staff/${staffId}/overview`)}
