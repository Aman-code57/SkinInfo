import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UploadCapture from "./component/uploadcapture";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  return <UploadCapture />;
}
