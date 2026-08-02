import { GET as primaryGet, POST as primaryPost } from "../../v1/students/route"; import { deprecated } from "@/lib/phase3/api";
export async function GET(request:Request){const url=new URL(request.url);if(url.searchParams.has("search")&&!url.searchParams.has("q"))url.searchParams.set("q",url.searchParams.get("search")!);return deprecated(await primaryGet(new Request(url,request)),"/api/v1/students")}
export async function POST(request:Request){return deprecated(await primaryPost(request),"/api/v1/students")}
