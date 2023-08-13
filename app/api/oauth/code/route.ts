import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const { access_token: kakaoAccessToken, refresh_token: kakaoRefreshToken } =
    await getKakaoToken(code!);

  const kakaoAccountInfo = await getUserInfo(kakaoAccessToken);

  const { accessToken, refreshToken } = fakeTokenExchange(
    kakaoAccessToken,
    kakaoRefreshToken
  );

  const response = NextResponse.redirect("http://localhost:3000/home", {
    status: 302,
  });

  response.cookies.set({
    name: "fake_accessToken",
    value: accessToken,
    httpOnly: true,
    maxAge: 60 * 60,
  });

  response.cookies.set({
    name: "fake_refreshToken",
    value: refreshToken,
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
  });

  return response;
}

const getKakaoToken = async (code: string) => {
  const { KAKAO_API_KEY } = process.env;
  const url = "https://kauth.kakao.com/oauth/token";
  const params = {
    grant_type: "authorization_code",
    client_id: `${KAKAO_API_KEY}`,
    redirect_uri: "http://localhost:3000/api/oauth/code",
    code,
  };

  // @see https://devtalk.kakao.com/t/react-invalid-client-koe010/114139
  const queryStringBody = Object.keys(params)
    .map((k) => encodeURIComponent(k) + "=" + encodeURI(params[k]))
    .join("&");

  try {
    const response = await fetch(url, {
      method: "POST",
      body: queryStringBody,
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(e as Error);
  }
};

const getUserInfo = async (accessToken: string) => {
  const url = "https://kapi.kakao.com/v2/user/me";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(e as Error);
  }
};

const fakeTokenExchange = (accessToken: string, refreshToken: string) => {
  return {
    accessToken: `fake_access-${accessToken}`,
    refreshToken: `fake_refresh-${refreshToken}`,
  };
};
