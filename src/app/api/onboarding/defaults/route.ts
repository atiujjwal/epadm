import { GET as primary } from "../../v1/setup/defaults/route"; import { deprecated } from "@/lib/phase3/api"; export async function GET(){return deprecated(await primary(),"/api/v1/setup/defaults")}
