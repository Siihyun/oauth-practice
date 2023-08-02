import { redirect } from "next/navigation";

export async function GET() {
  const { KAKAO_API_KEY } = process.env;
  const REDIRECT_URI = "http://localhost:3000/api/oauth/code";

  return redirect(
    `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`
  );
}
